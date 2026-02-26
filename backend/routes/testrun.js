const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const prisma = new PrismaClient();
const router = express.Router();
/*
====================================================
CREATE TEST RUN
POST /api/testruns
====================================================
*/
router.post(
  "/",
  auth,
  role(["admin"]),
  async (req, res) => {
    try {
      const {
        name,
        description,
        startDate,
        endDate,
        testerIds,
        testCaseIds,
      } = req.body;

      if (!name || !startDate || !endDate) {
        return res.status(400).json({
          msg: "Name, start date and end date are required",
        });
      }

      const testRun = await prisma.testRun.create({
        data: {
          name,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          createdById: req.user.id,
          assignments: testerIds
            ? {
                create: testerIds.map((id) => ({
                  testerId: id,
                })),
              }
            : undefined,
          testCases: testCaseIds
            ? {
                create: testCaseIds.map((id) => ({
                  testCaseId: id,
                })),
              }
            : undefined,
        },
      });

      res.status(201).json({
        msg: "Test Run created successfully",
        data: testRun,
      });

    } catch (err) {
      console.error("CREATE RUN ERROR:", err);
      res.status(500).json({ msg: "Failed to create test run" });
    }
  }
);
/*
====================================================
ASSIGN TESTER TO RUN
POST /api/testruns/:runId/assign
====================================================
*/

router.post(
  "/:runId/assign",
  auth,
  role(["admin"]),
  async (req, res) => {
    try {
      const runId = Number(req.params.runId);
      const { testerId } = req.body;

      if (!testerId) {
        return res.status(400).json({ msg: "Tester ID required" });
      }

      const assignment = await prisma.testRunAssignment.create({
        data: {
          testRunId: runId,
          testerId,
        },
      });

      res.json({
        msg: "Tester assigned successfully",
        data: assignment,
      });

    } catch (err) {
      console.error("ASSIGN ERROR:", err);
      res.status(500).json({ msg: "Failed to assign tester" });
    }
  }
);

/*
====================================================
GET RUN PROGRESS
GET /api/testruns
====================================================
*/
router.get(
  "/:runId/progress",
  auth,
  async (req, res) => {
    try {
      const runId = Number(req.params.runId);

      // 1️⃣ Total assigned test cases
      const total = await prisma.testRunTestCase.count({
        where: { testRunId: runId },
      });

      // 2️⃣ All executions for this run
      const executions = await prisma.testExecution.findMany({
        where: { testRunId: runId },
      });

      // 3️⃣ Only completed executions (not In Progress)
      const completed = executions.filter(
        (e) => e.status !== "In Progress"
      ).length;

      const pass = executions.filter(
        (e) => e.status === "Pass"
      ).length;

      const fail = executions.filter(
        (e) => e.status === "Fail"
      ).length;

      const blocked = executions.filter(
        (e) => e.status === "Blocked"
      ).length;

      // 4️⃣ Calculate progress
      const progress =
        total === 0 ? 0 : Math.round((completed / total) * 100);

      res.json({
        total,
        completed,
        pass,
        fail,
        blocked,
        progress,
      });

    } catch (err) {
      console.error("PROGRESS ERROR:", err);
      res.status(500).json({ msg: "Failed to get progress" });
    }
  }
);

router.get("/", auth, async (req, res) => {
  try {

    let runs;

    if (req.user.role === "admin") {
      // Admin sees all runs
      runs = await prisma.testRun.findMany({
  include: {
    assignments: {
      include: {
        tester: {
          select: { id: true, name: true, email: true },
        },
      },
    },
    executions: true,
    testCases: {
      include: {
        testCase: true,
      },
    },
  },
  orderBy: { createdAt: "desc" },
});

    } else if (req.user.role === "tester") {
      // Tester sees only assigned runs
      runs = await prisma.testRun.findMany({
        where: {
          assignments: {
            some: {
              testerId: req.user.id,
            },
          },
        },
       include: {
  assignments: {
    include: {
      tester: {
        select: { id: true, name: true, email: true },
      },
    },
  },
  executions: true,
  testCases: {
    include: {
      testCase: true,
    },
  },
},
      });

    } else {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(runs);

  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch test runs" });
  }
});

router.get("/:runId/testcases", auth, async (req, res) => {
  const runId = Number(req.params.runId);

  const runCases = await prisma.testRunTestCase.findMany({
    where: { testRunId: runId },
    include: {
      testCase: true,
    },
  });

  res.json(runCases.map(rc => rc.testCase));
});
module.exports = router;