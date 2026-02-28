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

const testCasePriority = stepExecution.execution.testCase.priority;

let mappedPriority;

if (testCasePriority === "High") {
  mappedPriority = BugPriority.P2_High;
} else if (testCasePriority === "Medium") {
  mappedPriority = BugPriority.P3_Medium;
} else if (testCasePriority === "Low") {
  mappedPriority = BugPriority.P4_Low;
} else {
  mappedPriority = BugPriority.P3_Medium; // fallback
}

const testCaseSeverity = stepExecution.execution.testCase.severity;

let mappedSeverity;

if (testCaseSeverity === "Blocker") {
  mappedSeverity = BugSeverity.Blocker;
} else if (testCaseSeverity === "Critical") {
  mappedSeverity = BugSeverity.Critical;
} else if (testCaseSeverity === "Major") {
  mappedSeverity = BugSeverity.Major;
} else if (testCaseSeverity === "Minor") {
  mappedSeverity = BugSeverity.Minor;
} else if (testCaseSeverity === "Trivial") {
  mappedSeverity = BugSeverity.Trivial;
} else {
  mappedSeverity = BugSeverity.Major; // fallback
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
      priority: mappedPriority,
      severity: mappedSeverity,
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

      const { priority, severity, status, sortBy } = req.query;

      let whereCondition = {};

      if (req.user.role === "tester") {
        whereCondition.reportedById = req.user.id;
      }

      if (req.user.role === "developer") {
        whereCondition.assignedToId = req.user.id;
      }

      // 🔥 Filtering
      if (priority) whereCondition.priority = priority;
      if (severity) whereCondition.severity = severity;
      if (status) whereCondition.status = status;

      // 🔥 Sorting
      let orderBy = { createdAt: "desc" };

      if (sortBy === "priority") {
        orderBy = { priority: "asc" };
      }

      if (sortBy === "age") {
        orderBy = { createdAt: "asc" };
      }

      const bugs = await prisma.bug.findMany({
        where: whereCondition,
        include: {
          reportedBy: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
        orderBy,
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

      // 🔥 Fetch bug first
      const bug = await prisma.bug.findUnique({
        where: { id: bugId },
      });

      if (!bug) {
        return res.status(404).json({ msg: "Bug not found" });
      }

      if (bug.status !== BugStatus.New) {
        return res.status(400).json({
          msg: "Only new bugs can be assigned",
        });
      }

      // Ensure selected user is developer
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
          status: BugStatus.Open,
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

router.put(
  "/status/:bugId",
  auth,
  async (req, res) => {
    try {
      const bugId = Number(req.params.bugId);
      const { status, fixNotes, commitLink, rejectionReason } = req.body;

      const bug = await prisma.bug.findUnique({
        where: { id: bugId },
      });

      if (!bug) {
        return res.status(404).json({ msg: "Bug not found" });
      }

      const current = bug.status;
      const userRole = req.user.role;

      const transitions = {
  New: ["Open", "Wont_Fix", "Duplicate"],
  Open: ["In_Progress", "Wont_Fix"],   // 👈 ADD THIS
  In_Progress: ["Fixed"],
  Fixed: ["Verified", "Reopened"],
  Verified: ["Closed"],
  Reopened: ["In_Progress"],
};

      if (!transitions[current]?.includes(status)) {
        return res.status(400).json({
          msg: `Invalid transition from ${current} to ${status}`,
        });
      }

      // Role-based enforcement
      if (current === "Open" && status === "In_Progress" && userRole !== "developer") {
        return res.status(403).json({ msg: "Only developer can start work" });
      }

      if (current === "In_Progress" && status === "Fixed" && userRole !== "developer") {
        return res.status(403).json({ msg: "Only developer can mark fixed" });
      }

      if (current === "Fixed" && ["Verified", "Reopened"].includes(status) && userRole !== "tester") {
        return res.status(403).json({ msg: "Only tester can verify or reopen" });
      }

      if (current === "Verified" && status === "Closed" && userRole !== "admin") {
        return res.status(403).json({ msg: "Only admin can close bug" });
      }

      const updated = await prisma.bug.update({
        where: { id: bugId },
        data: {
              status,
              fixNotes: status === "Fixed" ? fixNotes : bug.fixNotes,
              commitLink: status === "Fixed" ? commitLink : bug.commitLink,
              description:
            status === "Wont_Fix"
                ? `${bug.description}\n\nRejection Reason:\n${rejectionReason}`
                : bug.description,
},
      });

     res.json({
  msg: `Bug ${status.replace("_", " ")} successfully`,
  bug: updated,
});

    } catch (err) {
      console.error("STATUS UPDATE ERROR:", err);
      res.status(500).json({ msg: "Failed to update status" });
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
