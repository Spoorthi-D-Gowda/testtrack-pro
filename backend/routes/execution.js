const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

const prisma = new PrismaClient();
const router = express.Router();

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
/*
===========================================
FR-EX-001: GET EXECUTION DETAILS
===========================================
GET /api/executions/:executionId
*/

router.get(
  "/:executionId",
  auth,
  role(["tester", "admin"]),
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
            orderBy: {
              testStep: {
                stepNo: "asc",
              },
            },
          },
        },
      });

      if (!execution) {
        return res.status(404).json({ msg: "Execution not found" });
      }

      res.json(execution);

    } catch (err) {
      console.error("GET EXECUTION ERROR:", err);
      res.status(500).json({ msg: "Failed to fetch execution" });
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


/*
===========================================
FR-EX-001: COMPLETE EXECUTION
===========================================
POST /api/executions/complete/:executionId
*/

router.post(
  "/complete/:executionId",
  auth,
  role(["tester", "admin"]),
  async (req, res) => {
    try {
      const executionId = Number(req.params.executionId);

      const execution = await prisma.testExecution.findUnique({
        where: { id: executionId },
        include: { stepExecutions: true },
      });

      if (!execution) {
        return res.status(404).json({ msg: "Execution not found" });
      }

      const steps = execution.stepExecutions;

      let overallStatus = "Pass";

      if (steps.some((s) => s.status === "Fail")) {
        overallStatus = "Fail";
      } else if (steps.some((s) => s.status === "Blocked")) {
        overallStatus = "Blocked";
      } else if (steps.some((s) => s.status === "Pending")) {
        overallStatus = "In Progress";
      }

      const completed = await prisma.testExecution.update({
        where: { id: executionId },
        data: {
          status: overallStatus,
          completedAt: new Date(),
        },
      });

      res.json({
        msg: "Execution completed",
        data: completed,
      });

    } catch (err) {
      console.error("COMPLETE EXECUTION ERROR:", err);
      res.status(500).json({ msg: "Failed to complete execution" });
    }
  }
);

module.exports = router;