const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const prisma = new PrismaClient();
const router = express.Router();

/*
=========================================
FR-RPT-001: GLOBAL TEST EXECUTION REPORT
GET /api/reports/execution
=========================================
*/

router.get(
  "/execution",
  auth,
  role(["admin", "tester"]),
  async (req, res) => {
    try {

      // ==========================
      // 1️⃣ TOTAL EXECUTED
      // ==========================
      const totalExecuted = await prisma.testExecution.count();

      // ==========================
      // 2️⃣ STATUS BREAKDOWN
      // ==========================
      const breakdown = await prisma.testExecution.groupBy({
        by: ["status"],
        _count: { status: true }
      });

      let passCount = 0;
      let failCount = 0;
      let blockedCount = 0;
      let skippedCount = 0;

      breakdown.forEach(item => {
        if (item.status === "Pass") passCount = item._count.status;
        if (item.status === "Fail") failCount = item._count.status;
        if (item.status === "Blocked") blockedCount = item._count.status;
        if (item.status === "Skipped") skippedCount = item._count.status;
      });

      const passRate =
        totalExecuted > 0
          ? ((passCount / totalExecuted) * 100).toFixed(2)
          : 0;

      // ==========================
      // 3️⃣ FAILED TEST CASE DETAILS
      // ==========================
      const failedCases = await prisma.testExecution.findMany({
        where: { status: "Fail" },
        include: {
          testCase: true,
          tester: { select: { name: true } }
        },
        orderBy: { completedAt: "desc" }
      });

      // ==========================
      // 4️⃣ EXECUTION BY TESTER
      // ==========================
      const testerStats = await prisma.testExecution.groupBy({
        by: ["testerId"],
        _count: true
      });

      const testerDetails = await Promise.all(
        testerStats.map(async (t) => {
          const user = await prisma.user.findUnique({
            where: { id: t.testerId },
            select: { name: true }
          });

          return {
            tester: user?.name || "Unknown",
            count: t._count._all
          };
        })
      );

   // ==========================
// EXECUTION BY MODULE
// ==========================

const executions = await prisma.testExecution.findMany({
  include: { testCase: true }
});

const moduleMap = {};

for (const exec of executions) {
  const moduleName = exec.testCase?.module || "Unassigned";

  if (!moduleMap[moduleName]) {
    moduleMap[moduleName] = 0;
  }

  moduleMap[moduleName]++;
}

const moduleStats = [];

for (const moduleName in moduleMap) {
  moduleStats.push({
    module: moduleName,
    count: moduleMap[moduleName]
  });
}

      // ==========================
      // 6️⃣ EXECUTION TIMELINE
      // ==========================
      const timelineMap = {};

      executions.forEach(exec => {
        if (!exec.completedAt) return;

        const date = exec.completedAt.toISOString().split("T")[0];

        timelineMap[date] = (timelineMap[date] || 0) + 1;
      });

      const timeline = Object.entries(timelineMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
console.log("MODULE STATS:", moduleStats);
      res.json({
        totalExecuted,
        passCount,
        failCount,
        blockedCount,
        skippedCount,
        passRate,
        failedCases,
        byTester: testerDetails,
        byModule: moduleStats,
        timeline
      });

    } catch (err) {
      console.error("REPORT ERROR:", err);
      res.status(500).json({ msg: "Failed to generate report" });
    }
  }
);

module.exports = router;