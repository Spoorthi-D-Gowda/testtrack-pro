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
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.json(cases);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// ================= UPDATE TEST CASE =================
// Update Test Case with Versioning
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
    summary // NEW
  } = req.body;

  try {

    const id = Number(req.params.id);

    // Get old data
    const oldCase = await prisma.testCase.findUnique({
      where: { id },
    });

    if (!oldCase) {
      return res.status(404).json({ msg: "Not found" });
    }

    // Save old version
    await prisma.testCaseVersion.create({
      data: {
        testCaseId: id,
        version: oldCase.version,
        summary: summary || "Updated test case",

        snapshot: oldCase,

        editedById: req.user.id,
      },
    });

    // Update main record
    const updated = await prisma.testCase.update({
      where: { id },

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

        version: {
          increment: 1,
        },
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

    await prisma.testCase.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ msg: "Deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get Version History
router.get("/:id/history", auth, async (req, res) => {

  try {

    const history = await prisma.testCaseVersion.findMany({
      where: {
        testCaseId: Number(req.params.id),
      },

      include: {
        editedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },

      orderBy: {
        version: "desc",
      },
    });

    res.json(history);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load history" });
  }
});


module.exports = router;
