import { useEffect, useState } from "react";
import axios from "axios";
import "../auth.css";

export default function ExecutionCompare({ testCaseId }) {

  const [executions, setExecutions] = useState([]);
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

useEffect(() => {
  if (!testCaseId) return;

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/executions/history/${testCaseId}`,
        {
          headers: { "x-auth-token": token },
        }
      );
      setExecutions(res.data);
    } catch (err) {
      console.error("Failed to fetch history");
    }
  };

  fetchHistory();
}, [testCaseId]);

  if (executions.length < 2) {
    return <div>No previous execution to compare</div>;
  }

  const latest = executions[0];
  const previous = executions[1];

return (
  <div className="compare-container">

    <h2>Execution Comparison</h2>

    {latest.stepExecutions.map((step) => {

     const prevStep = previous.stepExecutions.find(
  (s) => s.testStepId === step.testStepId
);

      return (
        <div key={step.id} className="compare-row">

          <div className="compare-box">
            <h4>Previous</h4>
            <p>Status: {prevStep?.status || "N/A"}</p>
            <p>Actual: {prevStep?.actual || "N/A"}</p>
          </div>

          <div className="compare-box">
            <h4>Latest</h4>
            <p>Status: {step.status}</p>
            <p>Actual: {step.actual}</p>
          </div>

        </div>
      );
    })}

  </div>
);
}