import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../auth.css";

export default function Reports({ reportTab }) {

  const [report, setReport] = useState(null);
  const [bugReport, setBugReport] = useState(null);
  const [loadingExecution, setLoadingExecution] = useState(false);
const [loadingBug, setLoadingBug] = useState(false);

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

const fetchReport = useCallback(async () => {
  try {
    setLoadingExecution(true);

    const res = await axios.get(
      "http://localhost:5000/api/reports/execution",
      {
        headers: { "x-auth-token": token },
      }
    );

    setReport(res.data);

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingExecution(false);
  }
}, [token]); // ✅ dependency here

const fetchBugReport = useCallback(async () => {
  try {
    setLoadingBug(true);

    const res = await axios.get(
      "http://localhost:5000/api/reports/bugs",
      {
        headers: { "x-auth-token": token },
      }
    );

    setBugReport(res.data);

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingBug(false);
  }
}, [token]);

useEffect(() => {
  if (reportTab === "execution") {
    fetchReport();
  }
}, [reportTab, fetchReport]);  // ✅ now ESLint happy

useEffect(() => {
  if (reportTab === "bug") {
    fetchBugReport();
  }
}, [reportTab, fetchBugReport]);


  return (
    <div className="auth-container">
      <div className="auth-card test-card">
    {reportTab === "execution" && (
  <>
    <h2>Test Execution Report</h2>

    {loadingExecution && <p>Loading report...</p>}

    {!loadingExecution && report && (
      <>
        {/* ===== Summary Cards ===== */}
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

        {/* ===== Failed Test Cases ===== */}
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
            {report.failedCases?.length === 0 ? (
              <tr>
                <td colSpan="3">No failed executions 🎉</td>
              </tr>
            ) : (
              report.failedCases?.slice(0, 10).map((fc) => (
                <tr key={fc.id}>
                  <td>{fc.testCase?.title}</td>
                  <td>{fc.tester?.name || "-"}</td>
                  <td style={{ color: "#ef4444" }}>
                    {fc.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ===== Execution By Tester ===== */}
        <h3 style={{ marginTop: "30px" }}>
          Execution By Tester
        </h3>

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

        {/* ===== Execution By Module ===== */}
        <h3 style={{ marginTop: "30px" }}>
          Execution By Module
        </h3>

        <table className="report-table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Executions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(report?.byModule) &&
              report.byModule.map((m, index) => (
                <tr key={index}>
                  <td>{m.module}</td>
                  <td>{m.count}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* ===== Execution Timeline ===== */}
        <h3 style={{ marginTop: "30px" }}>
          Execution Timeline
        </h3>

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
  </>
)}
{reportTab === "bug" && (
  <>
    <h2>Bug Report</h2>
  {loadingBug && <p>Loading bug report...</p>}

    {!loadingBug && bugReport && (
      <>

    <div className="summary-grid">
      <div className="summary-card">
        <h4>Total Bugs</h4>
        <p>{bugReport.totalBugs}</p>
      </div>

      <div className="summary-card">
        <h4>Avg Resolution (Days)</h4>
        <p>{bugReport.avgResolutionDays}</p>
      </div>
    </div>

    {/* Status */}
    <h3>Bug By Status</h3>
    <table className="report-table">
      <tbody>
        {bugReport.byStatus.map((b, i) => (
          <tr key={i}>
            <td>{b.status}</td>
            <td>{b._count.status}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Severity */}
    <h3>Bug By Severity</h3>
    <table className="report-table">
      <tbody>
        {bugReport.bySeverity.map((b, i) => (
          <tr key={i}>
            <td>{b.severity}</td>
            <td>{b._count.severity}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Priority */}
    <h3>Bug By Priority</h3>
    <table className="report-table">
      <tbody>
        {bugReport.byPriority.map((b, i) => (
          <tr key={i}>
            <td>{b.priority}</td>
            <td>{b._count.priority}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Developer */}
    <h3>Bug By Developer</h3>
    <table className="report-table">
      <tbody>
        {bugReport.byDeveloper.map((d, i) => (
          <tr key={i}>
            <td>{d.developer}</td>
            <td>{d.count}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Aging */}
    <h3>Bug Aging (Days Open)</h3>
    <table className="report-table">
      <tbody>
        {bugReport.aging.map((a, i) => (
          <tr key={i}>
            <td>{a.bugId}</td>
            <td>{a.title}</td>
            <td>{a.daysOpen} days</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Trend */}
    <h3>Bug Trend Over Time</h3>
    <table className="report-table">
      <tbody>
        {bugReport.trend.map((t, i) => (
          <tr key={i}>
            <td>{t.date}</td>
            <td>{t.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
 </>
    )}
  </>
)}
      </div>
    </div>
  );
}