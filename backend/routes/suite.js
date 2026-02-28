const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const prisma = new PrismaClient();
const router = express.Router();

/*
====================================
FR-TS-001: CREATE TEST SUITE
====================================
*/

// CREATE SUITE
router.post("/", auth, role(["tester", "admin"]), async (req, res) => {
  try {
    if (!req.body) {
  return res.status(400).json({ msg: "Request body missing" });
}

const { name, description, module, parentId, testCaseIds } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ msg: "Suite name is required" });
    }

    const suite = await prisma.testSuite.create({
  data: {
    name,
    description,
    module,
    parentId: parentId ? Number(parentId) : null,
    createdById: req.user.id,
  },
});

if (testCaseIds && Array.isArray(testCaseIds) && testCaseIds.length > 0) {

  await prisma.suiteTestCase.createMany({
    data: testCaseIds.map((id, index) => ({
      suiteId: suite.id,
      testCaseId: id,
      order: index + 1,
    })),
  });

}

    res.status(201).json({
      msg: "Test Suite created successfully",
      data: suite,
    });

  } catch (err) {
    console.error("CREATE SUITE ERROR:", err);
    res.status(500).json({ msg: "Failed to create suite" });
  }
});
router.get("/", auth, role(["tester", "admin"]), async (req, res) => {
  try {
    const userRole = req.user?.role;

    const suites = await prisma.testSuite.findMany({
      where: userRole === "admin"
        ? {}
        : { isArchived: false },
      include: {
        children: true,
        parent: true,
        createdBy: {
          select: { name: true, email: true },
        },
        testCases: {
          include: {
            testCase: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(suites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load suites" });
  }
});
// ADD TEST CASE TO SUITE
router.post("/:suiteId/add", auth, role(["tester", "admin"]), async (req, res) => {
  try {
    const suiteId = Number(req.params.suiteId);
    const { testCaseId } = req.body;

    if (!testCaseId) {
      return res.status(400).json({ msg: "Test case ID required" });
    }

    const count = await prisma.suiteTestCase.count({
      where: { suiteId },
    });

    const record = await prisma.suiteTestCase.create({
      data: {
        suiteId,
        testCaseId,
        order: count + 1,
      },
    });

    res.json({
      msg: "Test case added to suite",
      data: record,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to add test case" });
  }
});
// REMOVE TEST CASE FROM SUITE
router.delete(
  "/:suiteId/remove/:suiteTestCaseId",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const suiteTestCaseId = Number(req.params.suiteTestCaseId);

      await prisma.suiteTestCase.delete({
        where: { id: suiteTestCaseId },
      });

      res.json({ msg: "Test case removed from suite" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Failed to remove test case" });
    }
  }
);
// REORDER TEST CASES
router.put(
  "/:suiteId/reorder",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const { items } = req.body;

if (!Array.isArray(items)) {
  return res.status(400).json({ msg: "Invalid reorder data" });
}
      for (const item of items) {
        await prisma.suiteTestCase.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }

      res.json({ msg: "Order updated" });
    } catch (err) {
      res.status(500).json({ msg: "Failed to reorder" });
    }
  }
);
// CLONE SUITE
router.post(
  "/:suiteId/clone",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const suiteId = Number(req.params.suiteId);

      const original = await prisma.testSuite.findUnique({
        where: { id: suiteId },
        include: { testCases: true },
      });

      if (!original) {
        return res.status(404).json({ msg: "Suite not found" });
      }

      const newSuite = await prisma.testSuite.create({
        data: {
          name: original.name + " (Copy)",
          description: original.description,
          module: original.module,
          parentId: original.parentId,
          createdById: req.user.id,
        },
      });

      if (original.testCases.length > 0) {
        await prisma.suiteTestCase.createMany({
          data: original.testCases.map((tc) => ({
            suiteId: newSuite.id,
            testCaseId: tc.testCaseId,
            order: tc.order,
          })),
        });
      }

      res.json({ msg: "Suite cloned successfully" });
    } catch (err) {
      console.error("CLONE ERROR:", err);
      res.status(500).json({ msg: "Failed to clone suite" });
    }
  }
);
/*
====================================
FR-TS-002: EXECUTE SUITE
====================================
*/

router.post(
  "/:suiteId/execute",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const suiteId = Number(req.params.suiteId);
      const { mode } = req.body; // "sequential" or "parallel"

      const suite = await prisma.testSuite.findUnique({
        where: { id: suiteId },
        include: {
          testCases: {
            include: { testCase: true },
            orderBy: { order: "asc" },
          },
        },
      });

      if (!suite || suite.testCases.length === 0) {
        return res.status(400).json({
          msg: "Suite has no test cases",
        });
      }

      // 1️⃣ Create SuiteExecution
      const suiteExecution = await prisma.suiteExecution.create({
        data: {
          suiteId,
          executedById: req.user.id,
          mode,
        },
      });

      // 2️⃣ Create TestExecutions for each test case
      for (const item of suite.testCases) {
        const execution = await prisma.testExecution.create({
          data: {
            testCaseId: item.testCaseId,
            testerId: req.user.id,
            suiteExecutionId: suiteExecution.id,
          },
        });

        // create step executions
        const steps = await prisma.testStep.findMany({
          where: { testCaseId: item.testCaseId },
          orderBy: { stepNo: "asc" },
        });

        await prisma.testStepExecution.createMany({
          data: steps.map((step) => ({
            executionId: execution.id,
            testStepId: step.id,
          })),
        });
      }

      res.json({
        msg: "Suite execution started",
        suiteExecutionId: suiteExecution.id,
      });

    } catch (err) {
      console.error("SUITE EXECUTION ERROR:", err);
      res.status(500).json({ msg: "Failed to execute suite" });
    }
  }
);
// ARCHIVE SUITE
router.put("/:suiteId/archive", auth, role(["tester", "admin"]), async (req, res) => {
  const suiteId = Number(req.params.suiteId);

  await prisma.testSuite.update({
    where: { id: suiteId },
    data: { isArchived: true },
  });

  res.json({ msg: "Suite archived" });
});

// RESTORE SUITE
router.put("/:suiteId/restore", auth, role(["admin"]), async (req, res) => {
  const suiteId = Number(req.params.suiteId);

  await prisma.testSuite.update({
    where: { id: suiteId },
    data: { isArchived: false },
  });

  res.json({ msg: "Suite restored" });
});
router.get(
  "/execution/:suiteExecutionId",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    const id = Number(req.params.suiteExecutionId);

    const suiteExecution =
      await prisma.suiteExecution.findUnique({
        where: { id },
        include: {
          executions: {
            include: {
              testCase: true,
            },
            orderBy: {
              id: "asc",   // 🔥 IMPORTANT
            },
          },
        },
      });
      if (!suiteExecution) {
  return res.status(404).json({
    msg: "Suite execution not found"
  });
}
    res.json(suiteExecution);
  }
);

router.get(
  "/execution/:suiteExecutionId/report",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const id = Number(req.params.suiteExecutionId);

      const executions = await prisma.testExecution.findMany({
        where: { suiteExecutionId: id },
      });

      const total = executions.length;
      const pass = executions.filter(e => e.status === "Pass").length;
      const fail = executions.filter(e => e.status === "Fail").length;
      const blocked = executions.filter(e => e.status === "Blocked").length;

      const progress = total === 0
        ? 0
        : Math.round(((pass + fail + blocked) / total) * 100);

      res.json({
        total,
        pass,
        fail,
        blocked,
        progress,
      });

    } catch (err) {
      res.status(500).json({ msg: "Failed to fetch report" });
    }
  }
);

module.exports = router;