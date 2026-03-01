import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../auth.css";

export default function Reports() {

  const [report, setReport] = useState(null);

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const fetchReport = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/reports/execution",
        {
          headers: { "x-auth-token": token },
        }
      );

      setReport(res.data);

    } catch (err) {
      console.error(err);
      alert("Failed to load report");
    }
  }, [token]);   // ✅ dependency here

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);   // ✅ now ESLint happy


  return (
    <div className="auth-container">
      <div className="auth-card test-card">
        <h2>Test Execution Report</h2>

        {report && (
          <>
            <div className="summary-grid">
              <div className="summary-card">
                <h4>Total Executed</h4>
                <p>{report.totalExecuted}</p>
              </div>

              <div className="summary-card pass">
                <h4>Passed</h4>
                <p>{report.passCount}</p>
              </div>

              <div className="summary-card fail">
                <h4>Failed</h4>
                <p>{report.failCount}</p>
              </div>

              <div className="summary-card blocked">
                <h4>Blocked</h4>
                <p>{report.blockedCount}</p>
              </div>

              <div className="summary-card skipped">
  <h4>Skipped</h4>
  <p>{report.skippedCount}</p>
</div>

              <div className="summary-card rate">
                <h4>Pass Rate</h4>
                <p>{report.passRate}%</p>
              </div>
            </div>

            <h3 style={{ marginTop: "30px" }}>
              Recent Failed Test Cases
            </h3>

            <table className="report-table">
              <thead>
                <tr>
                  <th>Test Case</th>
                  <th>Tester</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.failedCases.length === 0 ? (
                  <tr>
                    <td colSpan="3">No failed executions 🎉</td>
                  </tr>
                ) : (
                  report.failedCases.slice(0, 10).map((fc) => (
                    <tr key={fc.id}>
                      <td>{fc.testCase.title}</td>
                      <td>{fc.tester?.name || "-"}</td>
                      <td style={{ color: "#ef4444" }}>
                        {fc.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

                <h3 style={{ marginTop: "30px" }}>Execution By Tester</h3>

<table className="report-table">
  <thead>
    <tr>
      <th>Tester</th>
      <th>Executions</th>
    </tr>
  </thead>
  <tbody>
   {Array.isArray(report?.byTester) &&
  report.byTester.map((t, index) => (
      <tr key={index}>
        <td>{t.tester}</td>
        <td>{t.count}</td>
      </tr>
    ))}
  </tbody>
</table>

<h3 style={{ marginTop: "30px" }}>Execution By Module</h3>

<table className="report-table">
  <thead>
    <tr>
      <th>Module</th>
      <th>Executions</th>
    </tr>
  </thead>
  <tbody>
    {Array.isArray(report.byModule) &&
  report.byModule.map((m, index) => (
      <tr key={index}>
        <td>{m.module}</td>
        <td>{m.count}</td>
      </tr>
    ))}
  </tbody>
</table>
<h3 style={{ marginTop: "30px" }}>Execution Timeline</h3>

<table className="report-table">
  <thead>
    <tr>
      <th>Date</th>
      <th>Executions</th>
    </tr>
  </thead>
  <tbody>
    {Array.isArray(report?.timeline) &&
  report.timeline.map((t, index) => (
      <tr key={index}>
        <td>{t.date}</td>
        <td>{t.count}</td>
      </tr>
    ))}
  </tbody>
</table>

          </>
        )}

      </div>
    </div>
  );
}