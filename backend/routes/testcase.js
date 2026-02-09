const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();

const router = express.Router();

// Create Test Case
router.post("/", auth, async (req, res) => {
  const {
    title,
    description,
    steps,
    expected,
    priority,
    status,
  } = req.body;

  try {
    const testCase = await prisma.testCase.create({
      data: {
        title,
        description,
        steps,
        expected,
        priority,
        status,
        userId: req.user.id,
      },
    });

    res.json(testCase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get All Test Cases
router.get("/", auth, async (req, res) => {
  try {
    const cases = await prisma.testCase.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(cases);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Update Test Case
router.put("/:id", auth, async (req, res) => {
  const {
    title,
    description,
    steps,
    expected,
    priority,
    status,
  } = req.body;

  try {
    const updated = await prisma.testCase.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        title,
        description,
        steps,
        expected,
        priority,
        status,
      },
    });

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Update failed" });
  }
});
// Clone Test Case
router.post("/clone/:id", auth, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const oldCase = await prisma.testCase.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!oldCase) {
      return res.status(404).json({ msg: "Test case not found" });
    }

    const cloned = await prisma.testCase.create({
      data: {
        title: oldCase.title + " (Copy)",
        description: oldCase.description,
        steps: oldCase.steps,
        expected: oldCase.expected,
        priority: oldCase.priority,
        status: oldCase.status,

        userId: req.user.id, // FIX
      },
    });

    res.json(cloned);

  } catch (err) {
    console.error("CLONE ERROR:", err);

    res.status(500).json({
      msg: "Clone failed",
      error: err.message,
    });
  }
});



// Delete Test Case
router.delete("/:id", auth, async (req, res) => {
  try {
    await prisma.testCase.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ msg: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
