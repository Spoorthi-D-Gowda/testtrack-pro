const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const prisma = new PrismaClient();
const router = express.Router();

router.post(
  "/complete/:executionId",
  auth,
  role(["tester"]),
  async (req, res) => {
    try {
      const executionId = Number(req.params.executionId);
      const { totalTime } = req.body; // 👈 receive from frontend

      const stepExecutions = await prisma.testStepExecution.findMany({
        where: { executionId },
      });

      let finalStatus = "Pass";

      if (stepExecutions.some(s => s.status === "Fail")) {
        finalStatus = "Fail";
      } else if (stepExecutions.some(s => s.status === "Blocked")) {
        finalStatus = "Blocked";
      }

      const updated = await prisma.testExecution.update({
        where: { id: executionId },
        data: {
          status: finalStatus,
          completedAt: new Date(),
          totalTime: totalTime, // 👈 store seconds
        },
      });

      res.json({
        msg: "Execution completed",
        execution: updated,
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Failed to complete execution" });
    }
  }
);

/*
===========================================
FR-EX-001: START EXECUTION
===========================================
POST /api/executions/start/:testCaseId
*/

router.post(
  "/start/:testCaseId",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const testCaseId = Number(req.params.testCaseId);

      // 👇 READ runId FROM QUERY
      const runId = req.query.runId
        ? Number(req.query.runId)
        : null;

      console.log("RunId received:", runId);

      const testCase = await prisma.testCase.findUnique({
        where: { id: testCaseId },
        include: { steps: true },
      });

      if (!testCase) {
        return res.status(404).json({ msg: "Test case not found" });
      }

      if (testCase.steps.length === 0) {
        return res.status(400).json({ msg: "No steps found in test case" });
      }

      // 👇 SAVE testRunId
      const execution = await prisma.testExecution.create({
        data: {
          testCaseId,
          testerId: req.user.id,
          status: "In Progress",
          testRunId: runId,
        },
      });

      await prisma.testStepExecution.createMany({
        data: testCase.steps.map((step) => ({
          executionId: execution.id,
          testStepId: step.id,
          status: "Pending",
          actual: "",
          notes: "",
        })),
      });

      res.status(201).json({
        msg: "Execution started",
        executionId: execution.id,
      });

    } catch (err) {
      console.error("START EXECUTION ERROR:", err);
      res.status(500).json({ msg: "Failed to start execution" });
    }
  }
);

router.get(
  "/",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {

      let whereCondition = {};

      // Tester sees only their executions
      if (req.user.role === "tester") {
        whereCondition.testerId = req.user.id;
      }

      const executions = await prisma.testExecution.findMany({
        where: whereCondition,
        include: {
          testCase: true,
          tester: {
            select: { id: true, name: true },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
      });

      res.json(executions);

    } catch (err) {
      console.error("FETCH EXECUTIONS ERROR:", err);
      res.status(500).json({ msg: "Failed to fetch executions" });
    }
  }
);

/*
===========================================
FR-EX-006: GET EXECUTION HISTORY BY TEST CASE
===========================================
GET /api/executions/history/:testCaseId
*/

router.get(
  "/history/:testCaseId",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {

      const testCaseId = Number(req.params.testCaseId);

      if (!testCaseId || isNaN(testCaseId)) {
        return res.status(400).json({
          msg: "Invalid testCaseId"
        });
      }

      const executions = await prisma.testExecution.findMany({
  where: {
    testCaseId: testCaseId,
    status: {
      not: "In Progress",
    },
  },
        include: {
          stepExecutions: {
            include: {
              testStep: true,
            },
            orderBy: {
              testStep: {
                stepNo: "asc",
              },
            },
          },
          tester: {
            select: { id: true, name: true },
          },
        },
        orderBy: {
          startedAt: "desc",
        },
      });

      res.json(executions);

    } catch (err) {
      console.error("FETCH HISTORY ERROR:", err);
      res.status(500).json({ msg: "Failed to fetch execution history" });
    }
  }
);

/*
===========================================
FR-EX-001: GET EXECUTION DETAILS
===========================================
GET /api/executions/:executionId
*/

router.get(
  "/:executionId",
  auth,
  async (req, res) => {
    try {
      const executionId = Number(req.params.executionId);

      const execution = await prisma.testExecution.findUnique({
        where: { id: executionId },
        include: {
          testCase: true,
          stepExecutions: {
            include: {
              testStep: true,
            },
          },
          tester: true,
        },
      });

      if (!execution) {
        return res.status(404).json({ msg: "Execution not found" });
      }

      res.json(execution);

    } catch (err) {
      res.status(500).json({ msg: "Failed to fetch execution details" });
    }
  }
);
/*
===========================================
FR-EX-001: UPDATE STEP (AUTO SAVE)
===========================================
PUT /api/executions/step/:stepExecutionId
*/

router.put(
  "/step/:stepExecutionId",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const stepExecutionId = Number(req.params.stepExecutionId);
      const { actual, status, notes } = req.body;

      const existing = await prisma.testStepExecution.findUnique({
  where: { id: stepExecutionId },
});

const updated = await prisma.testStepExecution.update({
  where: { id: stepExecutionId },
  data: {
    actual: actual ?? existing.actual,
    status: status ?? existing.status,
    notes: notes ?? existing.notes,
  },
});

      res.json({
        msg: "Step updated successfully",
        data: updated,
      });

    } catch (err) {
      console.error("UPDATE STEP ERROR:", err);
      res.status(500).json({ msg: "Failed to update step" });
    }
  }
);

const multer = require("multer");
const path = require("path");

const evidenceStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/executions/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const evidenceUpload = multer({
  storage: evidenceStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max global
});


router.post(
  "/step/:stepExecutionId/evidence",
  auth,
  role(["tester", "admin"]),
  evidenceUpload.single("file"),
  async (req, res) => {
    try {
      const stepExecutionId = Number(req.params.stepExecutionId);

      if (!req.file) {
        return res.status(400).json({ msg: "File required" });
      }

      const { mimetype, size, originalname, path: filePath } = req.file;

      // File size validation
      if (mimetype.startsWith("image/") && size > 10 * 1024 * 1024) {
        return res.status(400).json({ msg: "Image max 10MB" });
      }

      if (mimetype.startsWith("video/") && size > 100 * 1024 * 1024) {
        return res.status(400).json({ msg: "Video max 100MB" });
      }

      if (
        (mimetype === "text/plain" ||
          mimetype === "application/json") &&
        size > 50 * 1024 * 1024
      ) {
        return res.status(400).json({ msg: "Log max 50MB" });
      }

      const evidence = await prisma.executionEvidence.create({
        data: {
          fileName: originalname,
          filePath,
          fileType: mimetype,
          fileSize: size,
          stepExecutionId,
        },
      });

      res.json({
        msg: "Evidence uploaded successfully",
        data: evidence,
      });

    } catch (err) {
      console.error("EVIDENCE ERROR:", err);
      res.status(500).json({ msg: "Upload failed" });
    }
  }
);
module.exports = router;