const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();

const router = express.Router();

const generateTCId = async () => {
  const count = await prisma.testCase.count();

  const num = (count + 1).toString().padStart(5, "0");

  return `TC-2026-${num}`;
};

// ================= CREATE TEST CASE =================
router.post("/", auth, async (req, res) => {
  try {

    const {
      title,
      description,
      module,
      priority,
      severity,
      type,
      status,

      preconditions,
      postconditions,
      cleanupSteps,

      testData,
      environment,

      tags,
      estimatedTime,

      automationStatus,
      automationLink,

      steps,
    } = req.body;

    // Generate Test Case ID
     const count = await prisma.testCase.count();

    const year = new Date().getFullYear();

    const testCaseId = `TC-${year}-${String(count + 1).padStart(4, "0")}`;

    // Create Test Case
    const testCase = await prisma.testCase.create({
      data: {
        testCaseId,

        title,
        description,
        module,
        priority,
        severity,
        type,
        status,

        preconditions,
        postconditions: postconditions || "",
        cleanupSteps: cleanupSteps || "",

        testData,
        environment,

        tags: tags || [],

        estimatedTime: estimatedTime || "",

        automationStatus: automationStatus || "Not Automated",
        automationLink: automationLink || "",

        userId: req.user.id,

        // ✅ Save steps properly
        steps: {
          create: steps.map((s, index) => ({
            stepNo: index + 1,
            action: s.action,
            testData: s.testData || "",
            expected: s.expected,

            status: "Pending",
            actual: "",
            notes: "",
          })),
        },
      },
      include: {
        steps: true, // Return steps also
      },
    });

    res.status(201).json(testCase);

  } catch (err) {
    console.error("CREATE ERROR:", err);

    res.status(500).json({
      msg: "Create failed",
      error: err.message,
    });
  }
});


// ================= GET ALL TEST CASES =================
router.get("/", auth, async (req, res) => {

  try {

const cases = await prisma.testCase.findMany({
  where: {
    userId: req.user.id,
    isDeleted: false,
  },

  include: {
    steps: true,
  },

  orderBy: {
    createdAt: "desc",
  },
});



    res.json(cases);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {

    const id = Number(req.params.id);

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
      summary,
      expected, // keep only if exists in schema
    } = req.body;

    // 1. Get old record
    const oldCase = await prisma.testCase.findUnique({
      where: { id },
      include: { steps: true },
    });

    if (!oldCase) {
      return res.status(404).json({
        msg: "Test case not found ❌",
      });
    }

    // 2. Save version
    await prisma.testCaseVersion.create({
      data: {
        testCaseId: id,
        version: oldCase.version,
        summary: summary || "Updated test case",
        snapshot: oldCase,
        editedById: req.user.id,
      },
    });

    // 3. Update main record
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

        // ✅ Only if field exists in Prisma model
        expected: expected || oldCase.expected,

        version: {
          increment: 1,
        },
      },
    });

    // 4. Update steps (WITHOUT deleting old ones)
    if (Array.isArray(steps)) {

      // Delete only if user removed steps
      await prisma.testStep.deleteMany({
        where: { testCaseId: id },
      });

      await prisma.testStep.createMany({
        data: steps.map((s, index) => ({
          testCaseId: id,
          stepNo: index + 1,
          action: s.action,
          testData: s.testData || "",
          expected: s.expected,
          status: "Pending",
          actual: "",
          notes: "",
        })),
      });
    }

    return res.json({
      msg: "Test case updated successfully ✅",
      data: updated,
    });

  } catch (err) {

    console.error("UPDATE ERROR:", err);

    return res.status(500).json({
      msg: "Failed to update test case ❌",
      error: err.message,
    });
  }
}
);

// Clone Test Case (With Steps + All Fields)
  router.post("/clone/:id", auth, async (req, res) => {
  try {

    const id = Number(req.params.id);

    // Get old test case with steps
    const oldCase = await prisma.testCase.findUnique({
      where: { id },
      include: {
        steps: true,
      },
    });

    if (!oldCase) {
      return res.status(404).json({ msg: "Test case not found" });
    }

    // Generate new TestCaseId
    const newTcId = `TC-${Date.now()}`;

    // Create cloned test case
    const cloned = await prisma.testCase.create({
      data: {
        testCaseId: newTcId,

        title: oldCase.title + " (Copy)",
        description: oldCase.description,
        module: oldCase.module,

        priority: oldCase.priority,
        severity: oldCase.severity,
        type: oldCase.type,

        status: "Draft",

        preconditions: oldCase.preconditions,
        postconditions: oldCase.postconditions,
        cleanupSteps: oldCase.cleanupSteps,

        testData: oldCase.testData,
        environment: oldCase.environment,

        tags: oldCase.tags || [],
        estimatedTime: oldCase.estimatedTime,

        automationStatus: oldCase.automationStatus || "Not Automated",
        automationLink: oldCase.automationLink,

        expected: oldCase.expected,

        version: 1,

        userId: req.user.id,

        // Clone steps
        steps: {
          create: oldCase.steps.map((s) => ({
            stepNo: s.stepNo,
            action: s.action,
            testData: s.testData,
            expected: s.expected,
            actual: s.actual,
            status: s.status,
            notes: s.notes,
          })),
        },
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
    res.status(500).json({ msg: "Failed to delete" });
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

