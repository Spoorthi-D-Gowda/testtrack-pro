const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const prisma = new PrismaClient();
const router = express.Router();

/*
=========================================
FR-RPT-002: BUG REPORT
GET /api/reports/bugs
=========================================
*/

router.get(
  "/bugs",
  auth,
  role(["admin", "tester", "developer"]),
  async (req, res) => {
    try {

      // 1️⃣ TOTAL BUGS
      const totalBugs = await prisma.bug.count();

      // 2️⃣ BUGS BY STATUS
      const byStatus = await prisma.bug.groupBy({
        by: ["status"],
        _count: { status: true }
      });

      // 3️⃣ BUGS BY SEVERITY
      const bySeverity = await prisma.bug.groupBy({
        by: ["severity"],
        _count: { severity: true }
      });

      // 4️⃣ BUGS BY PRIORITY
      const byPriority = await prisma.bug.groupBy({
        by: ["priority"],
        _count: { priority: true }
      });

      // 5️⃣ BUGS BY DEVELOPER
      const devRaw = await prisma.bug.groupBy({
        by: ["assignedToId"],
        _count: { _all: true }
      });

      const byDeveloper = await Promise.all(
        devRaw.map(async (d) => {
          let user = null;

          if (d.assignedToId) {
            user = await prisma.user.findUnique({
              where: { id: d.assignedToId },
              select: { name: true }
            });
          }

          return {
            developer: user?.name || "Unassigned",
            count: d._count._all
          };
        })
      );

      // 6️⃣ BUG AGING (days open)
      const openBugs = await prisma.bug.findMany({
        where: { status: { not: "Closed" } }
      });

      const aging = openBugs.map((bug) => {
        const daysOpen = Math.floor(
          (new Date() - new Date(bug.createdAt)) /
          (1000 * 60 * 60 * 24)
        );

        return {
          bugId: bug.id,
          title: bug.title,
          daysOpen
        };
      });

      // 7️⃣ BUG TREND (created per day)
      const allBugs = await prisma.bug.findMany();

      const trendMap = {};

      allBugs.forEach((bug) => {
        const date = bug.createdAt
          .toISOString()
          .split("T")[0];

        trendMap[date] = (trendMap[date] || 0) + 1;
      });

      const trend = Object.entries(trendMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // 8️⃣ RESOLUTION TIME (Closed Bugs)
      const closedBugs = await prisma.bug.findMany({
        where: { status: "Closed" }
      });

      let avgResolutionDays = 0;

      if (closedBugs.length > 0) {
        const totalDays = closedBugs.reduce((sum, bug) => {
          const days = Math.floor(
            (new Date(bug.updatedAt) - new Date(bug.createdAt)) /
            (1000 * 60 * 60 * 24)
          );
          return sum + days;
        }, 0);

        avgResolutionDays = (
          totalDays / closedBugs.length
        ).toFixed(2);
      }

      res.json({
        totalBugs,
        byStatus,
        bySeverity,
        byPriority,
        byDeveloper,
        aging,
        trend,
        avgResolutionDays
      });

    } catch (err) {
      console.error("BUG REPORT ERROR:", err);
      res.status(500).json({ msg: "Failed to generate bug report" });
    }
  }
);
/*
=========================================
FR-RPT-003: Developer Performance Report
GET /api/reports/developer-performance
=========================================
*/

router.get(
  "/developer-performance",
  auth,
  role(["admin", "tester", "developer"]),
  async (req, res) => {
    try {

      const developers = await prisma.user.findMany({
        where: { role: "developer" }
      });

      const report = await Promise.all(
        developers.map(async (dev) => {

          // Assigned bugs
          const assigned = await prisma.bug.count({
            where: { assignedToId: dev.id }
          });

          // Closed bugs
          const resolvedBugs = await prisma.bug.findMany({
            where: {
              assignedToId: dev.id,
              status: "Closed"
            }
          });

          const resolved = resolvedBugs.length;

          // Average resolution time
          let avgResolutionDays = 0;

          if (resolved > 0) {
            const totalDays = resolvedBugs.reduce((sum, bug) => {
              const days = Math.floor(
                (new Date(bug.updatedAt) - new Date(bug.createdAt)) /
                (1000 * 60 * 60 * 24)
              );
              return sum + days;
            }, 0);

            avgResolutionDays = (totalDays / resolved).toFixed(2);
          }

          // Reopened bugs
          const reopened = await prisma.bug.count({
            where: {
              assignedToId: dev.id,
              status: "Reopened"
            }
          });

          const reopenRate =
            assigned > 0
              ? ((reopened / assigned) * 100).toFixed(2)
              : 0;

          // Fix quality %
          const fixQuality =
            assigned > 0
              ? ((resolved / assigned) * 100).toFixed(2)
              : 0;

          return {
            developer: dev.name,
            assigned,
            resolved,
            avgResolutionDays,
            reopenRate,
            fixQuality
          };
        })
      );

      res.json(report);

    } catch (err) {
      console.error("DEV PERFORMANCE ERROR:", err);
      res.status(500).json({ msg: "Failed to generate developer performance report" });
    }
  }
);

module.exports = router;