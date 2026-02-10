const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();

const router = express.Router();


// ================= CREATE TEST CASE =================
router.post("/", auth, async (req, res) => {

  const {
    title,
    description,
    module,
    priority,
    severity,
    type,
    status,
    preconditions,
    testData,
    environment,
    steps,
    expected,
  } = req.body;

  try {

    const testCase = await prisma.testCase.create({
      data: {
        title,
        description,
        module,
        priority,
        severity,
        type,
        status,
        preconditions,
        testData,
        environment,
        steps,
        expected,

        userId: req.user.id,
      },
    });

    res.json(testCase);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ================= GET ALL TEST CASES =================
router.get("/", auth, async (req, res) => {

  try {

    const cases = await prisma.testCase.findMany({
  where: {
    userId: req.user.id,
    isDeleted: false, // IMPORTANT
  },
  orderBy: { createdAt: "desc" },
});


    res.json(cases);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ================= UPDATE TEST CASE =================
router.put("/:id", auth, async (req, res) => {

  const {
    title,
    description,
    module,
    priority,
    severity,
    type,
    status,
    preconditions,
    testData,
    environment,
    steps,
    expected,
  } = req.body;

  try {

    const updated = await prisma.testCase.update({
      where: {
        id: Number(req.params.id),
      },

      data: {
        title,
        description,
        module,
        priority,
        severity,
        type,
        status,
        preconditions,
        testData,
        environment,
        steps,
        expected,
      },
    });

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Update failed" });
  }
});


// ================= CLONE TEST CASE =================
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
        module: oldCase.module,
        priority: oldCase.priority,
        severity: oldCase.severity,
        type: oldCase.type,
        status: oldCase.status,
        preconditions: oldCase.preconditions,
        testData: oldCase.testData,
        environment: oldCase.environment,
        steps: oldCase.steps,
        expected: oldCase.expected,

        userId: req.user.id,
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


// ================= DELETE TEST CASE =================
router.delete("/:id", auth, async (req, res) => {
  try {

    await prisma.testCase.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        isDeleted: true, // SOFT DELETE
      },
    });

    res.json({ msg: "Deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});



module.exports = router;
