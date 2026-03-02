const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTestCases = await prisma.testCase.count();
    const totalBugs = await prisma.bug.count();

    const passedTestCases = await prisma.testExecution.count({
      where: { status: "Pass" }
    });

    const failedTestCases = await prisma.testExecution.count({
      where: { status: "Fail" }
    });

    const blockedTestCases = await prisma.testExecution.count({
      where: { status: "Blocked" }
    });

    const skippedTestCases = await prisma.testExecution.count({
      where: { status: "Skipped" }
    });

    const bugsDetected = await prisma.bug.count({
      where: { reportedById: userId }
    });

    const testers = await prisma.user.findMany({
      where: { role: "tester" },
      select: { id: true, name: true, email: true }
    });

    const developers = await prisma.user.findMany({
      where: { role: "developer" },
      select: { id: true, name: true, email: true }
    });

    const admins = await prisma.user.findMany({
  where: { role: "admin" },
  select: { id: true, name: true, email: true }
});

    const executedTotal =
      passedTestCases +
      failedTestCases +
      blockedTestCases +
      skippedTestCases;

    const progress =
      totalTestCases > 0
        ? ((executedTotal / totalTestCases) * 100).toFixed(0)
        : 0;

// ===== Developer Dashboard Stats =====
let devStats = null;

if (req.user.role === "developer") {

  const bugsAssigned = await prisma.bug.count({
    where: { assignedToId: userId }
  });

  const bugsResolved = await prisma.bug.count({
    where: {
      assignedToId: userId,
      status: "Closed"
    }
  });

  const reopenedBugs = await prisma.bug.count({
    where: {
      assignedToId: userId,
      status: "Reopened"
    }
  });

  const severityStats = await prisma.bug.groupBy({
    by: ["severity"],
    where: { assignedToId: userId },
    _count: { severity: true }
  });

  const priorityStats = await prisma.bug.groupBy({
    by: ["priority"],
    where: { assignedToId: userId },
    _count: { priority: true }
  });

const assignedTestCasesRaw = await prisma.bug.findMany({
  where: { assignedToId: userId },
  select: {
    id: true,
    testCase: {
      select: {
        id: true,
        title: true,
        user: { select: { name: true } }
      }
    }
  }
});
const assignedTestCases = assignedTestCasesRaw
  .map(b => b.testCase)
  .filter(tc => tc !== null);

  devStats = {
    bugsAssigned,
    bugsResolved,
    reopenedBugs,
    severityStats,
    priorityStats,
    assignedTestCases
  };
}

res.json({
  totalTestCases,
  totalBugs,
  passedTestCases,
  failedTestCases,
  blockedTestCases,
  skippedTestCases,
  bugsDetected,
  testers,
  developers,
  admins,
  progress,
  devStats
});

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ msg: "Failed to load dashboard stats" });
  }
});
module.exports = router;
