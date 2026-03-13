import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../auth.css";

export default function ExecutionCompare({ testCaseId }) {

  const [executions, setExecutions] = useState([]);
  const token =
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("accessToken");

useEffect(() => {
  if (!testCaseId) return;

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
  `http://localhost:5000/api/executions/history/${testCaseId}`,
  {
    headers: {
      "x-auth-token": token,
      "x-project-id": localStorage.getItem("projectId")
    }
  }
);
      setExecutions(res.data);
    } catch (err) {
  console.error(err);

  Swal.fire({
    icon: "error",
    title: "Execution History Error",
    text: "Failed to load execution comparison data"
  });
}
  };

  fetchHistory();
}, [testCaseId]);

if (executions.length < 2) {
  return (
    <div className="compare-container">
      <h2>Execution Comparison</h2>
      <p style={{color:"#666"}}>
        No previous execution available to compare.
      </p>
    </div>
  );
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