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
    parentId: parentId ? Number(parentId) : null,
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
router.get("/", auth, role(["tester", "admin"]), async (req, res) => {
  try {
    const userRole = req.user?.role;

    const suites = await prisma.testSuite.findMany({
      where: userRole === "admin"
        ? {}
        : { isArchived: false },
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
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(suites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to load suites" });
  }
  console.log("USER ROLE:", req.user);
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
// REMOVE TEST CASE FROM SUITE
router.delete(
  "/:suiteId/remove/:suiteTestCaseId",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const suiteTestCaseId = Number(req.params.suiteTestCaseId);

      await prisma.suiteTestCase.delete({
        where: { id: suiteTestCaseId },
      });

      res.json({ msg: "Test case removed from suite" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Failed to remove test case" });
    }
  }
);
// REORDER TEST CASES
router.put(
  "/:suiteId/reorder",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const { items } = req.body;

if (!Array.isArray(items)) {
  return res.status(400).json({ msg: "Invalid reorder data" });
}
      for (const item of items) {
        await prisma.suiteTestCase.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }

      res.json({ msg: "Order updated" });
    } catch (err) {
      res.status(500).json({ msg: "Failed to reorder" });
    }
  }
);
// CLONE SUITE
router.post(
  "/:suiteId/clone",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const suiteId = Number(req.params.suiteId);

      const original = await prisma.testSuite.findUnique({
        where: { id: suiteId },
        include: { testCases: true },
      });

      if (!original) {
        return res.status(404).json({ msg: "Suite not found" });
      }

      const newSuite = await prisma.testSuite.create({
        data: {
          name: original.name + " (Copy)",
          description: original.description,
          module: original.module,
          parentId: original.parentId,
          createdById: req.user.id,
        },
      });

      if (original.testCases.length > 0) {
        await prisma.suiteTestCase.createMany({
          data: original.testCases.map((tc) => ({
            suiteId: newSuite.id,
            testCaseId: tc.testCaseId,
            order: tc.order,
          })),
        });
      }

      res.json({ msg: "Suite cloned successfully" });
    } catch (err) {
      console.error("CLONE ERROR:", err);
      res.status(500).json({ msg: "Failed to clone suite" });
    }
  }
);
// ARCHIVE SUITE
router.put("/:suiteId/archive", auth, role(["tester", "admin"]), async (req, res) => {
  const suiteId = Number(req.params.suiteId);

  await prisma.testSuite.update({
    where: { id: suiteId },
    data: { isArchived: true },
  });

  res.json({ msg: "Suite archived" });
});

// RESTORE SUITE
router.put("/:suiteId/restore", auth, role(["admin"]), async (req, res) => {
  const suiteId = Number(req.params.suiteId);

  await prisma.testSuite.update({
    where: { id: suiteId },
    data: { isArchived: false },
  });

  res.json({ msg: "Suite restored" });
});

module.exports = router;