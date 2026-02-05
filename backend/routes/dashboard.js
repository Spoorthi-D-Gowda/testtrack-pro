const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTests = await prisma.testCase.count({
      where: { userId },
    });

    const passTests = await prisma.testCase.count({
      where: { userId, status: "Pass" },
    });

    const failTests = await prisma.testCase.count({
      where: { userId, status: "Fail" },
    });

    const pendingTests = await prisma.testCase.count({
      where: { userId, status: "Pending" },
    });

    const totalBugs = await prisma.bug.count({
      where: { userId },
    });

    const openBugs = await prisma.bug.count({
      where: { userId, status: "Open" },
    });

    const closedBugs = await prisma.bug.count({
      where: { userId, status: "Closed" },
    });

    res.json({
      totalTests,
      passTests,
      failTests,
      pendingTests,
      totalBugs,
      openBugs,
      closedBugs,
    });

  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
