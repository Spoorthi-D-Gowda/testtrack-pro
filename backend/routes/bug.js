const express = require("express");
const { PrismaClient, BugPriority, BugSeverity, BugStatus } = require("@prisma/client");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const prisma = new PrismaClient();
const router = express.Router();

const generateBugId = async () => {
  const year = new Date().getFullYear();

  const count = await prisma.bug.count();

  const padded = String(count + 1).padStart(5, "0");

  return `BUG-${year}-${padded}`;
};

// Create Bug
router.post(
  "/quick-fail/:stepExecutionId",
  auth,
  role(["admin","tester"]),
  async (req, res) => {
    try {
      const stepExecutionId = Number(req.params.stepExecutionId);

      const stepExecution = await prisma.testStepExecution.findUnique({
        where: { id: stepExecutionId },
        include: {
          execution: {
            include: {
              testCase: true,
            },
          },
          testStep: true,
        },
      });

      if (!stepExecution) {
        return res.status(404).json({ msg: "Step execution not found" });
      }

      if (stepExecution.status !== "Fail") {
  return res.status(400).json({
    msg: "Bug can only be created for failed steps"
  });
}

      // Prevent duplicate bug for same failed step
      const existingBug = await prisma.bug.findFirst({
  where: {
    stepExecutionId: stepExecutionId
  },
});

      if (existingBug) {
        return res.status(400).json({
          msg: "Bug already created for this step",
        });
      }

      const bugId = await generateBugId();

    try {

  const bug = await prisma.bug.create({
    data: {
      bugId,
      title: `Failure in ${stepExecution.execution.testCase.title}`,
      description: `
Test Case: ${stepExecution.execution.testCase.title}

Step Action:
${stepExecution.testStep.action}

Expected:
${stepExecution.testStep.expected}

Actual:
${stepExecution.actual}

Notes:
${stepExecution.notes}
`,
      testCaseId: stepExecution.execution.testCase.id,
      executionId: stepExecution.execution.id,
      stepExecutionId: stepExecution.id,
      reportedById: req.user.id,
      priority: BugPriority.P3_Medium,
      severity: BugSeverity.Major,
      status: BugStatus.New,
    },
  });

  return res.status(201).json({
    msg: "Bug created successfully",
    bug,
  });

} catch (error) {

  if (error.code === "P2002") {
    return res.status(400).json({
      msg: "Bug already created for this step",
    });
  }

  console.error("CREATE BUG ERROR:", error);
  return res.status(500).json({
    msg: "Failed to create bug",
  });
}

    } catch (err) {
      console.error("QUICK FAIL ERROR:", err);
      res.status(500).json({ msg: "Failed to create bug" });
    }
  }
);

// Get All Bugs
router.get(
  "/",
  auth,
  role(["admin", "developer", "tester"]),
  async (req, res) => {
    try {

      let whereCondition = {};

      // 👇 Tester sees only bugs they reported
      if (req.user.role === "tester") {
        whereCondition.reportedById = req.user.id;
      }

      // 👇 Developer sees only assigned bugs
      if (req.user.role === "developer") {
        whereCondition.assignedToId = req.user.id;
      }

      // 👇 Admin sees all (no filter)

      const bugs = await prisma.bug.findMany({
        where: whereCondition,
        include: {
          reportedBy: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          testCase: true,
          execution: true,
          stepExecution: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(bugs);

    } catch (err) {
      console.error("GET BUGS ERROR:", err);
      res.status(500).json({ msg: "Failed to fetch bugs" });
    }
  }
);
router.get(
  "/:bugId",
  auth,
  role(["admin", "developer", "tester"]),
  async (req, res) => {
    try {
      const bugId = Number(req.params.bugId);

      const bug = await prisma.bug.findUnique({
        where: { id: bugId },
        include: {
          testCase: true,
          execution: true,
          stepExecution: {
            include: {
              testStep: true,
            },
          },
          reportedBy: true,
          assignedTo: true,
        },
      });

      if (!bug) {
        return res.status(404).json({ msg: "Bug not found" });
      }

      res.json(bug);

    } catch (err) {
      console.error("GET BUG DETAIL ERROR:", err);
      res.status(500).json({ msg: "Failed to fetch bug" });
    }
  }
);
router.put(
  "/assign/:bugId",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const bugId = Number(req.params.bugId);
      const { developerId } = req.body;

      if (!developerId) {
        return res.status(400).json({
          msg: "Developer ID is required",
        });
      }

      // Optional: ensure assigned user is actually a developer
      const developer = await prisma.user.findUnique({
        where: { id: developerId },
      });

      if (!developer || developer.role !== "developer") {
        return res.status(400).json({
          msg: "Invalid developer selected",
        });
      }

      const updatedBug = await prisma.bug.update({
        where: { id: bugId },
        data: {
          assignedToId: developerId,
          status: "Open",
        },
      });

      res.json({
        msg: "Bug assigned successfully",
        bug: updatedBug,
      });

    } catch (err) {
      console.error("ASSIGN BUG ERROR:", err);
      res.status(500).json({ msg: "Failed to assign bug" });
    }
  }
);
// Update Bug
router.put(
  "/mark-fixed/:bugId",
  auth,
  role(["developer"]),
  async (req, res) => {
    try {
      const bugId = Number(req.params.bugId);
      const { fixNotes, commitLink } = req.body;

      const updatedBug = await prisma.bug.update({
        where: { id: bugId },
        data: {
          status: "Fixed",
          fixNotes,
          commitLink,
        },
      });

      res.json({
        msg: "Bug marked as fixed",
        bug: updatedBug,
      });

    } catch (err) {
      console.error("MARK FIXED ERROR:", err);
      res.status(500).json({ msg: "Failed to update bug" });
    }
  }
);

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
