const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

// Create Bug
router.post("/", auth, async (req, res) => {
  const { title, description, severity, status } = req.body;

  try {
    const bug = await prisma.bug.create({
      data: {
        title,
        description,
        severity,
        status,
        userId: req.user.id,
      },
    });

    res.json(bug);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get All Bugs
router.get("/", auth, async (req, res) => {
  try {
    const bugs = await prisma.bug.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(bugs);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update Bug
router.put("/:id", auth, async (req, res) => {
  const { title, description, severity, status } = req.body;

  try {
    const bug = await prisma.bug.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        description,
        severity,
        status,
      },
    });

    res.json(bug);
  } catch (err) {
    res.status(500).json({ msg: "Update failed" });
  }
});

// Delete Bug
router.delete("/:id", auth, async (req, res) => {
  try {
    await prisma.bug.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed" });
  }
});

module.exports = router;
