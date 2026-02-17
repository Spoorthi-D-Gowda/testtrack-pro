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


    // ================= VALIDATION =================

    if (!title || title.trim() === "") {
      return res.status(400).json({
        msg: "Title is required ",
      });
    }

    if (!description || description.trim() === "") {
      return res.status(400).json({
        msg: "Description is required ",
      });
    }

    if (!module || module.trim() === "") {
      return res.status(400).json({
        msg: "Module is required ",
      });
    }

    if (!priority) {
      return res.status(400).json({
        msg: "Priority is required ",
      });
    }

    if (!severity) {
      return res.status(400).json({
        msg: "Severity is required ",
      });
    }

    if (!type) {
      return res.status(400).json({
        msg: "Type is required ",
      });
    }

    if (!status) {
      return res.status(400).json({
        msg: "Status is required ",
      });
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return res.status(400).json({
        msg: "At least one test step is required ",
      });
    }

    // Validate each step
    for (const step of steps) {

      if (!step.action || step.action.trim() === "") {
        return res.status(400).json({
          msg: "Step action is required ",
        });
      }

      if (!step.expected || step.expected.trim() === "") {
        return res.status(400).json({
          msg: "Step expected result is required ",
        });
      }

    }


    // ================= GENERATE TEST CASE ID =================

    const count = await prisma.testCase.count();

    const year = new Date().getFullYear();

    const testCaseId =
      `TC-${year}-${String(count + 1).padStart(5, "0")}`;


    // ================= CREATE TEST CASE =================

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

        preconditions: preconditions || "",
        postconditions: postconditions || "",
        cleanupSteps: cleanupSteps || "",

        testData: testData || "",
        environment: environment || "",

        tags: tags || [],

        estimatedTime: estimatedTime || "",

        automationStatus: automationStatus || "Not Automated",
        automationLink: automationLink || "",

        userId: req.user.id,


        // ================= CREATE STEPS =================

        steps: {

          create: steps.map((s, index) => ({

            stepNo: index + 1,

            action: s.action,

            testData: s.testData || "",

            expected: s.expected,

            actual: "",

            status: "Pending",

            notes: "",

          })),

        },

      },

      include: {
        steps: true,
      },

    });


    return res.status(201).json({

      msg: "Test case created successfully ",

      data: testCase,

    });


  } catch (err) {

    console.error("CREATE ERROR:", err);

    return res.status(500).json({

      msg: "Failed to create test case ",

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
        msg: "Test case not found ",
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
      msg: "Test case updated successfully ",
      data: updated,
    });

  } catch (err) {

    console.error("UPDATE ERROR:", err);

    return res.status(500).json({
      msg: "Failed to update test case ",
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
    const newTcId =
      `TC-${year}-${String(count + 1).padStart(5, "0")}`;


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

// ================= UPDATE STEP EXECUTION =================
router.put("/step/:stepId", auth, async (req, res) => {

  try {

    const stepId = Number(req.params.stepId);

    const {
      actual,
      status,
      notes,
    } = req.body;

    // Check if step exists
    const existingStep = await prisma.testStep.findUnique({
      where: { id: stepId },
    });

    if (!existingStep) {

      return res.status(404).json({
        msg: "Step not found ❌",
      });

    }

    // Update step execution fields
    const updatedStep = await prisma.testStep.update({

      where: { id: stepId },

      data: {

        actual: actual ?? existingStep.actual,

        status: status ?? existingStep.status,

        notes: notes ?? existingStep.notes,

      },

    });

    return res.json({

      msg: "Step execution updated successfully ✅",

      data: updatedStep,

    });

  }
  catch (err) {

    console.error("STEP UPDATE ERROR:", err);

    return res.status(500).json({

      msg: "Failed to update step execution ❌",

      error: err.message,

    });

  }

});

// ================= SAVE AS TEMPLATE =================
router.post("/:id/template", auth, async (req, res) => {
  try {

    const id = Number(req.params.id);

    const testCase = await prisma.testCase.findUnique({
      where: { id },
      include: { steps: true },
    });

    if (!testCase) {
      return res.status(404).json({
        msg: "Test case not found"
      });
    }

    const template = await prisma.testCaseTemplate.create({
      data: {
        name: testCase.title,
        description: testCase.description,
        module: testCase.module,

        templateData: testCase,

        createdById: req.user.id,
      },
    });

    res.json({
      msg: "Template created successfully",
      template,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Failed to create template",
    });

  }
});


// ================= GET ALL TEMPLATES =================
router.get("/templates/all", auth, async (req, res) => {

  try {

    const templates = await prisma.testCaseTemplate.findMany({

      where: {
        createdById: req.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(templates);

  } catch (err) {

    res.status(500).json({
      msg: "Failed to load templates",
    });

  }

});


// ================= CREATE TESTCASE FROM TEMPLATE =================
router.post("/templates/use/:templateId", auth, async (req, res) => {

  try {

    const templateId = Number(req.params.templateId);

    const template = await prisma.testCaseTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return res.status(404).json({
        msg: "Template not found",
      });
    }

    const data = template.templateData;

    const count = await prisma.testCase.count();

    const year = new Date().getFullYear();

    const testCaseId =
      `TC-${year}-${String(count + 1).padStart(5, "0")}`;

    const newTestCase =
      await prisma.testCase.create({

        data: {

          testCaseId,

          title: data.title,
          description: data.description,
          module: data.module,
          priority: data.priority,
          severity: data.severity,
          type: data.type,

          status: "Draft",

          preconditions: data.preconditions,
          postconditions: data.postconditions,
          cleanupSteps: data.cleanupSteps,

          testData: data.testData,
          environment: data.environment,

          tags: data.tags,

          estimatedTime: data.estimatedTime,

          automationStatus: data.automationStatus,
          automationLink: data.automationLink,

          userId: req.user.id,

          steps: {
            create: data.steps.map(s => ({
              stepNo: s.stepNo,
              action: s.action,
              testData: s.testData,
              expected: s.expected,
              status: "Pending",
              actual: "",
              notes: "",
            })),
          },
        },
      });

    res.json({
      msg: "Test case created from template",
      data: newTestCase,
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Failed to create from template",
    });

  }

});
// ================= BULK DELETE =================
router.post("/bulk/delete", auth, async (req, res) => {
  try {

    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        msg: "No test cases selected",
      });
    }

    await prisma.testCase.updateMany({
      where: {
        id: { in: ids },
        userId: req.user.id,
      },
      data: {
        isDeleted: true,
      },
    });

    res.json({
      msg: `${ids.length} test cases deleted successfully`,
    });

  } catch (err) {

    console.error("BULK DELETE ERROR:", err);

    res.status(500).json({
      msg: "Bulk delete failed",
    });

  }
});

// ================= BULK STATUS UPDATE =================
router.post("/bulk/status", auth, async (req, res) => {
  try {

    const { ids, status } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        msg: "No test cases selected",
      });
    }

    await prisma.testCase.updateMany({
      where: {
        id: { in: ids },
        userId: req.user.id,
      },
      data: {
        status,
      },
    });

    res.json({
      msg: `${ids.length} test cases updated to ${status}`,
    });

  } catch (err) {

    console.error("BULK STATUS ERROR:", err);

    res.status(500).json({
      msg: "Bulk update failed",
    });

  }
});

const { Parser } = require("json2csv");

router.post("/bulk/export", auth, async (req, res) => {

  try {

    const { ids } = req.body;

    const testCases = await prisma.testCase.findMany({
      where: {
        id: { in: ids },
        userId: req.user.id,
        isDeleted: false,
      },
      include: {
        steps: true,
      },
    });

    const parser = new Parser();

    const csv = parser.parse(
      testCases.map(tc => ({
        TestCaseID: tc.testCaseId,
        Title: tc.title,
        Module: tc.module,
        Priority: tc.priority,
        Severity: tc.severity,
        Status: tc.status,
        CreatedAt: tc.createdAt,
      }))
    );

    res.header("Content-Type", "text/csv");

    res.attachment("testcases.csv");

    return res.send(csv);

  } catch (err) {

    console.error("EXPORT ERROR:", err);

    res.status(500).json({
      msg: "Export failed",
    });

  }

});


 module.exports = router;