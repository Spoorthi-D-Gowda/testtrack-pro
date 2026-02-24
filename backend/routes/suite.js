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
    parentId: parentId || null,
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

// GET ALL SUITES (Hierarchy Included)
router.get("/", auth, role(["tester", "admin"]), async (req, res) => {
  try {
    const suites = await prisma.testSuite.findMany({
      where: { isArchived: false },
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
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(suites);

  } catch (err) {
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

module.exports = router;