import { useEffect, useState, useCallback } from "react";
import api from "../api";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../auth.css";

export default function ExecuteTestCase() {
  const { testCaseId } = useParams();
const id = testCaseId;
 
  const navigate = useNavigate();

  const [executionId, setExecutionId] = useState(null);
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seconds, setSeconds] = useState(0);
const [isRunning, setIsRunning] = useState(true);
const [manualTime, setManualTime] = useState("");

  const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const runId = queryParams.get("runId");
const suiteExecutionId = queryParams.get("suiteExecutionId");
const sequence = Number(queryParams.get("sequence") || 0);
 console.log("Route ID:", id);
console.log("SuiteExecutionId:", suiteExecutionId);

const token =
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

useEffect(() => {
  let interval;

  if (isRunning) {
    interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }

  return () => clearInterval(interval);

}, [isRunning]);

const formatTime = (totalSeconds) => {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return `${hrs}h ${mins}m ${secs}s`;
};

  // ================= START EXECUTION =================
const startExecution = useCallback(async () => {
  try {

    const res = await api.post(
      `http://localhost:5000/api/executions/start/${id}`,
      {},
      {
        headers: { "x-auth-token": token },
        params: runId ? { runId } : {},
      }
    );

    setExecutionId(res.data.executionId);

  } catch (err) {
    console.error("START ERROR:", err.response?.data);
    alert(err.response?.data?.msg || "Failed to start execution");
  }
}, [id, token, runId]);

  // ================= FETCH EXECUTION =================
const fetchExecution = useCallback(async (id) => {
  try {
    const res = await api.get(
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
}, [token]);

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
    await api.put(
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

    setIsRunning(false);

    const finalTime = manualTime
      ? Number(manualTime)
      : seconds;

    await api.post(
      `http://localhost:5000/api/executions/complete/${executionId}`,
      { totalTime: finalTime },
      {
        headers: { "x-auth-token": token },
      }
    );

// After execution complete API call

// 🔵 If part of Suite Execution
if (suiteExecutionId) {

  // Fetch suite execution details
  const suiteRes = await api.get(
    `http://localhost:5000/api/suites/execution/${suiteExecutionId}`,
    { headers: { "x-auth-token": token } }
  );

  const executions = suiteRes.data.executions;

  // 🟣 Sequential Mode
  if (suiteRes.data.mode === "sequential") {

    const sortedExecutions = [...executions].sort(
      (a, b) => a.id - b.id
    );

    if (sequence + 1 < sortedExecutions.length) {
      const next = sortedExecutions[sequence + 1];

      window.location.href =
        `/execute/${next.id}` +
        `?suiteExecutionId=${suiteExecutionId}` +
        `&sequence=${sequence + 1}`;

      return;
    }

    // All done → go to suite page
navigate("/dashboard", {
  state: {
    activeSection: "suites",
  },
});
  }

  // 🟢 Parallel Mode → Always go back to list
if (suiteRes.data.mode === "parallel") {
  navigate("/dashboard", {
    state: {
      activeSection: "suiteExecution",
      suiteExecutionId: suiteExecutionId,
    },
  });
  return;
}
}

    alert("Execution completed successfully");
    navigate("/dashboard");

  } catch (err) {
    alert("Failed to complete execution");
  }
};
useEffect(() => {

  // 🟣 CASE 1: Coming from Suite (already have execution)
  if (suiteExecutionId) {

    const execId = Number(id);

    if (!execId || isNaN(execId)) {
      alert("Invalid execution ID");
      return;
    }

    setExecutionId(execId);
    fetchExecution(execId);
    return;
  }

  // 🔵 CASE 2: Normal execution from test case
  const testCaseId = Number(id);

  if (!testCaseId || isNaN(testCaseId)) {
    alert("Invalid Test Case ID");
    return;
  }

  startExecution();

}, [id, suiteExecutionId]);

useEffect(() => {
  if (executionId) {
    fetchExecution(executionId);
  }
}, [executionId, fetchExecution]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">Starting execution...</div>
      </div>
    );
  }
  const handleEvidenceUpload = async (stepId, file) => {
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    await api.post(
      `http://localhost:5000/api/executions/step/${stepId}/evidence`,
      formData,
      {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("Evidence uploaded successfully");

    // 🔥 Refresh execution to show new evidence
    fetchExecution(executionId);

  } catch (err) {
    alert(err.response?.data?.msg || "Upload failed");
  }
};

const quickFail = async (stepExecutionId) => {
  try {
    const res = await api.post(
      `http://localhost:5000/api/bugs/quick-fail/${stepExecutionId}`,
      {},
      {
        headers: { "x-auth-token": token },
      }
    );

    alert("Bug created successfully");

  } catch (err) {
    alert(err.response?.data?.msg || "Failed to create bug");
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card test-card">

        <h2>Execution: {execution?.testCase?.title}</h2>

        <div className="timer-box">
  <h3>Execution Timer: {formatTime(seconds)}</h3>

  {isRunning ? (
    <button
      className="warning-btn"
      onClick={() => setIsRunning(false)}
    >
      Pause
    </button>
  ) : (
    <button
      className="primary-btn"
      onClick={() => setIsRunning(true)}
    >
      Resume
    </button>
  )}

  <div style={{ marginTop: "10px" }}>
    <label>Manual Time (seconds): </label>
    <input
      type="number"
      value={manualTime}
      onChange={(e) => setManualTime(e.target.value)}
    />
  </div>
</div>

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

            {stepExec.status === "Fail" && (
  <button
    className="danger-btn"
    onClick={() => quickFail(stepExec.id)}
  >
    Fail & Create Bug
  </button>
)}

            <textarea
              placeholder="Notes"
              value={stepExec.notes}
              onChange={(e) =>
                updateStep(stepExec.id, "notes", e.target.value)
              }
            />
          {/* ===== Evidence Upload ===== */}
<div style={{ marginTop: "10px" }}>
  <label><b>Upload Evidence:</b></label>
  <input
    type="file"
    onChange={(e) =>
      handleEvidenceUpload(stepExec.id, e.target.files[0])
    }
  />
</div>
{/* ===== Display Uploaded Evidence ===== */}
{stepExec.evidences && stepExec.evidences.length > 0 && (
  <div style={{ marginTop: "8px" }}>
    <b>Evidence Files:</b>
    {stepExec.evidences.map((ev) => (
      <div key={ev.id}>
        <a
          href={`http://localhost:5000/${ev.filePath}`}
          target="_blank"
          rel="noreferrer"
        >
          {ev.fileName}
        </a>
      </div>
    ))}
  </div>
)}
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