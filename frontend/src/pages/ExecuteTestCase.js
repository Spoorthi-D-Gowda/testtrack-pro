import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../auth.css";

export default function ExecuteTestCase() {
  const { testCaseId } = useParams();
  const navigate = useNavigate();

  const [executionId, setExecutionId] = useState(null);
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const runId = queryParams.get("runId");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // ================= START EXECUTION =================
const startExecution = async () => {
  try {
    const res = await axios.post(
      `http://localhost:5000/api/executions/start/${testCaseId}`,
      {},
      {
        headers: { "x-auth-token": token },
        params: runId ? { runId } : {},
      }
    );

    setExecutionId(res.data.executionId);

  } catch (err) {
    alert("Failed to start execution");
  }
};

  // ================= FETCH EXECUTION =================
  const fetchExecution = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/executions/${id}`,
        {
          headers: { "x-auth-token": token },
        }
      );

      setExecution(res.data);
      setLoading(false);

    } catch (err) {
      alert("Failed to fetch execution");
    }
  };

  // ================= UPDATE STEP (AUTO SAVE) =================
const updateStep = async (stepExecutionId, field, value) => {
  try {
    // 1️⃣ Update local state immediately (optimistic UI)
    setExecution((prev) => ({
      ...prev,
      stepExecutions: prev.stepExecutions.map((step) =>
        step.id === stepExecutionId
          ? { ...step, [field]: value }
          : step
      ),
    }));

    // 2️⃣ Call backend (no re-fetch)
    await axios.put(
      `http://localhost:5000/api/executions/step/${stepExecutionId}`,
      { [field]: value },
      {
        headers: { "x-auth-token": token },
      }
    );

  } catch (err) {
    alert("Failed to update step");
  }
};

  // ================= COMPLETE EXECUTION =================
  const completeExecution = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/executions/complete/${executionId}`,
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      alert("Execution completed successfully");
      navigate("/dashboard");

    } catch (err) {
      alert("Failed to complete execution");
    }
  };

  useEffect(() => {
    startExecution();
  }, []);

  useEffect(() => {
    if (executionId) {
      fetchExecution(executionId);
    }
  }, [executionId]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">Starting execution...</div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card test-card">

        <h2>Execution: {execution?.testCase?.title}</h2>

        {execution?.stepExecutions.map((stepExec, index) => (
          <div key={stepExec.id} className="step-card">
            <h4>Step {index + 1}</h4>

            <p><b>Action:</b> {stepExec.testStep.action}</p>
            <p><b>Expected:</b> {stepExec.testStep.expected}</p>

            <textarea
              placeholder="Actual Result"
              value={stepExec.actual}
              onChange={(e) =>
                updateStep(stepExec.id, "actual", e.target.value)
              }
            />

            <select
              value={stepExec.status}
              onChange={(e) =>
                updateStep(stepExec.id, "status", e.target.value)
              }
            >
              <option>Pending</option>
              <option>Pass</option>
              <option>Fail</option>
              <option>Blocked</option>
              <option>Skipped</option>
            </select>

            <textarea
              placeholder="Notes"
              value={stepExec.notes}
              onChange={(e) =>
                updateStep(stepExec.id, "notes", e.target.value)
              }
            />
          </div>
        ))}

        <button
          className="success-btn"
          onClick={completeExecution}
        >
          Complete Execution
        </button>

      </div>
    </div>
  );
}