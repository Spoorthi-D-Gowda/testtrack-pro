import { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";
import "../auth.css";

export default function SuiteExecution({ suiteExecutionId }) {
  const [executions, setExecutions] = useState([]);

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

useEffect(() => {
  if (!suiteExecutionId) return;
  fetchSuiteExecution();
}, [suiteExecutionId]);

  const fetchSuiteExecution = async () => {
    try {
      const res = await api.get(
        `http://localhost:5000/api/suites/execution/${suiteExecutionId}`,
        { headers: { "x-auth-token": token } }
      );

      setExecutions(res.data.executions);

    } catch (err) {
      Swal.fire({
  icon: "error",
  title: "Error",
  text: "Failed to load suite execution"
});
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card test-card">

        <h2>Parallel Suite Execution</h2>

        {executions.map((exec, index) => (
          <div key={exec.id} className="step-card">
            <h4>{exec.testCase.title}</h4>

            <p>Status: {exec.status}</p>

            <button
              className="primary-btn"
              onClick={() =>
                window.location.href =
                  `/execute/${exec.id}` +
                  `?suiteExecutionId=${suiteExecutionId}` +
                  `&sequence=${index}`
              }
            >
              Execute
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}