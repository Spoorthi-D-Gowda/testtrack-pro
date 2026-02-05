const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const { Parser } = require("json2csv");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/report", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const tests = await prisma.testCase.findMany({
      where: { userId },
    });

    const bugs = await prisma.bug.findMany({
      where: { userId },
    });

    const parser = new Parser();
    const testCSV = parser.parse(tests);
    const bugCSV = parser.parse(bugs);

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=report.csv"
    );

    res.send(
      "TEST CASES\n\n" +
      testCSV +
      "\n\nBUG REPORTS\n\n" +
      bugCSV
    );

  } catch (err) {
    res.status(500).json({ msg: "Export failed" });
  }
});

module.exports = router;
