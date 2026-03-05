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

    const projectId = Number(req.headers["x-project-id"]);
if (!projectId) {
  return res.status(400).json({ msg: "Project ID required" });
}
    try {
      const {
        name,
        description,
        startDate,
        endDate,
        testerIds,
        testCaseIds, 
        milestoneId
      } = req.body;

      if (!name || !startDate || !endDate) {
        return res.status(400).json({
          msg: "Name, start date and end date are required",
        });
      }

if (testerIds && testerIds.length > 0) {
  const validTesters = await prisma.user.findMany({
    where: {
      id: { in: testerIds },
      role: "tester"
    },
    select: { id: true }
  });

  if (validTesters.length !== testerIds.length) {
    return res.status(400).json({
      msg: "Invalid tester IDs"
    });
  }
}

      if (testCaseIds && testCaseIds.length > 0) {
  const validCases = await prisma.testCase.findMany({
    where: {
      id: { in: testCaseIds },
      projectId
    },
    select: { id: true }
  });

  if (validCases.length !== testCaseIds.length) {
    return res.status(400).json({
      msg: "Some test cases do not belong to this project"
    });
  }
}

      const testRun = await prisma.testRun.create({
  data: {
    name,
    description,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    createdById: req.user.id,
    projectId,

    /* LINK MILESTONE */
    milestoneId: milestoneId ? Number(milestoneId) : null,

    /* ASSIGN TESTERS */
    assignments: {
      create: testerIds?.map((id) => ({
        testerId: id
      })) || []
    },

    /* LINK TEST CASES */
    testCases: {
      create: testCaseIds?.map((id) => ({
        testCaseId: id
      })) || []
    }
  }
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

const runId = Number(req.params.runId);
const projectId = Number(req.headers["x-project-id"]);
if (!projectId) {
  return res.status(400).json({ msg: "Project ID required" });
}
const run = await prisma.testRun.findFirst({
  where: { id: runId, projectId }
});

if (!run) {
  return res.status(404).json({ msg: "Run not found in this project" });
}
    try {
      const { testerId } = req.body;

      if (!testerId) {
        return res.status(400).json({ msg: "Tester ID required" });
      }

const existing = await prisma.testRunAssignment.findFirst({
  where: {
    testRunId: runId,
    testerId
  }
});

if (existing) {
  return res.status(400).json({
    msg: "Tester already assigned to this run"
  });
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

const runId = Number(req.params.runId);
const projectId = Number(req.headers["x-project-id"]);
if (!projectId) {
  return res.status(400).json({ msg: "Project ID required" });
}
const run = await prisma.testRun.findFirst({
  where: { id: runId, projectId }
});

if (!run) {
  return res.status(404).json({ msg: "Run not found in this project" });
}

    try {
     

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

    const projectId = Number(req.headers["x-project-id"]);
if (!projectId) {
  return res.status(400).json({ msg: "Project ID required" });
}

    let runs;

    if (req.user.role === "admin") {
  // Admin sees all runs
  runs = await prisma.testRun.findMany({
    where: { projectId },
    include: {
      milestone: true,   // ⭐ ADD THIS

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
    projectId,
          assignments: {
            some: {
              testerId: req.user.id,
            },
          },
        },
       include: {
  milestone: true,   // ⭐ ADD THIS

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
const projectId = Number(req.headers["x-project-id"]);
if (!projectId) {
  return res.status(400).json({ msg: "Project ID required" });
}

const run = await prisma.testRun.findFirst({
  where: { id: runId, projectId }
});

if (!run) {
  return res.status(404).json({ msg: "Run not found in this project" });
}

  const runCases = await prisma.testRunTestCase.findMany({
    where: { testRunId: runId },
    include: {
      testCase: true,
    },
  });

  res.json(runCases.map(rc => rc.testCase));
});
module.exports = router;