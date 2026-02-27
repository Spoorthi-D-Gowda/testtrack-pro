import { useEffect, useState } from "react";
import axios from "axios";
import "../auth.css";

export default function ExecutionHistory({
  setActiveSection,
  setSelectedCompareId
}) {

  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "N/A";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins}m ${secs}s`;
};

  const fetchExecutions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/executions",
        {
          headers: { "x-auth-token": token },
        }
      );
      setExecutions(res.data);
    } catch (err) {
      alert("Failed to fetch executions");
    }
  };

  const fetchExecutionDetails = async (id) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/executions/${id}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setSelectedExecution(res.data);
    } catch (err) {
      alert("Failed to fetch execution details");
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

   const grouped = executions.reduce((acc, exec) => {
  if (!acc[exec.testCase.id]) {
    acc[exec.testCase.id] = [];
  }
  acc[exec.testCase.id].push(exec);
  return acc;
}, {});


  return (
    <div className="auth-card test-card">

      <h2>Execution History</h2>

      <div className="execution-layout">

        {/* LEFT LIST */}
        <div className="execution-list">
            {Object.values(grouped).map((group) => {
  const latest = group[0]; // already sorted desc

  return (
    <div
      key={latest.id}
      className="execution-card"
      onClick={() => fetchExecutionDetails(latest.id)}
    >
      <h4>{latest.testCase.title}</h4>

      <p>Status: {latest.status}</p>
      <p>Time: {formatTime(latest.totalTime)}</p>
      <p>Total Runs: {group.length}</p>

      {/* Re-Execute */}
      <button
        className="primary-btn"
        onClick={(e) => {
          e.stopPropagation();
          window.location.href = `/execute/${latest.testCase.id}`;
        }}
      >
        Re-Execute
      </button>

      {/* Compare */}
      <button
        className="warning-btn"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCompareId(latest.testCase.id);
          setActiveSection("compare");
        }}
      >
        Compare
      </button>

    </div>
  );
})}

        </div>

        {/* RIGHT DETAILS */}
        <div className="execution-details">
          {selectedExecution && (
            <>
              <h3>{selectedExecution.testCase.title}</h3>
              <p>Status: {selectedExecution.status}</p>

              {selectedExecution.stepExecutions.map((step, index) => (
                <div key={step.id} className="step-card">
                  <h4>Step {index + 1}</h4>
                  <p><b>Action:</b> {step.testStep.action}</p>
                  <p><b>Expected:</b> {step.testStep.expected}</p>
                  <p><b>Actual:</b> {step.actual}</p>
                  <p><b>Status:</b> {step.status}</p>
                  <p><b>Notes:</b> {step.notes}</p>
                </div>
              ))}
            </>
          )}
        </div>

      </div>
    </div>
  );
}