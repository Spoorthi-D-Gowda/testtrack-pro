import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../auth.css";

export default function Reports({ reportTab }) {

  const [report, setReport] = useState(null);
  const [bugReport, setBugReport] = useState(null);
  const [loadingExecution, setLoadingExecution] = useState(false);
const [loadingBug, setLoadingBug] = useState(false);
const [devReport, setDevReport] = useState(null);
const [loadingDev, setLoadingDev] = useState(false);
const [testerReport, setTesterReport] = useState(null);
const [loadingTester, setLoadingTester] = useState(false);
const [showExportMenu, setShowExportMenu] = useState(false);
const [exporting, setExporting] = useState(false);

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

const fetchDevReport = useCallback(async () => {
  try {
    setLoadingDev(true);

    const res = await axios.get(
      "http://localhost:5000/api/reports/developer-performance",
      { headers: { "x-auth-token": token } }
    );

    setDevReport(res.data);

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingDev(false);
  }
}, [token]);

const fetchTesterReport = useCallback(async () => {
  try {
    setLoadingTester(true);

    const res = await axios.get(
      "http://localhost:5000/api/reports/tester-performance",
      { headers: { "x-auth-token": token } }
    );

    setTesterReport(res.data);

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingTester(false);
  }
}, [token]);

const handleExport = async (type) => {
  try {
    setExporting(true);

    const endpointMap = {
      execution: "execution",
      bug: "bugs",
      developer: "developer-performance",
      tester: "tester-performance"
    };

    const reportType = endpointMap[reportTab];

    const res = await axios.get(
      `http://localhost:5000/api/export/${reportType}/${type}`,
      {
        headers: { "x-auth-token": token },
        responseType: "blob"
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${reportType}.${type}`);
    document.body.appendChild(link);
    link.click();

    alert("Export successful ✅");

  } catch (err) {
    console.error(err);
    alert("Export failed ❌");
  } finally {
    setExporting(false);
    setShowExportMenu(false);
  }
};

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

useEffect(() => {
  if (reportTab === "developer") {
    fetchDevReport();
  }
}, [reportTab, fetchDevReport]);

useEffect(() => {
  if (reportTab === "tester") {
    fetchTesterReport();
  }
}, [reportTab, fetchTesterReport]);

  return (
    <div className="auth-container">
      <div className="auth-card test-card">

  {reportTab && (
  <div className="export-container">
    <button
      className="export-btn"
      onClick={() => setShowExportMenu(!showExportMenu)}
      disabled={exporting}
    >
      {exporting ? "Exporting..." : "Export ▾"}
    </button>

    {showExportMenu && (
      <div className="export-dropdown">
        <button onClick={() => handleExport("pdf")}>
          Export to PDF
        </button>
        <button onClick={() => handleExport("xlsx")}>
          Export to Excel
        </button>
        <button onClick={() => handleExport("csv")}>
          Export to CSV
        </button>
      </div>
    )}
  </div>
)}

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
    <div className="report-section-box">
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
    </div>

        {/* ===== Execution By Tester ===== */}
    <div className="report-section-box">
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
    </div>
        {/* ===== Execution By Module ===== */}
    <div className="report-section-box">
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
        </div>

        {/* ===== Execution Timeline ===== */}
  <div className="report-section-box">
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
        </div>
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

{/* ================= BUG BY STATUS ================= */}
<div className="report-box">
  <h3>Bug By Status</h3>
  <div className="report-box-body">
    {bugReport.byStatus.map((b, i) => (
      <div key={i} className="report-row">
        <span>{b.status}</span>
        <span className="count">{b._count.status}</span>
      </div>
    ))}
  </div>
</div>

{/* ================= BUG BY SEVERITY ================= */}
<div className="report-box">
  <h3>Bug By Severity</h3>
  <div className="report-box-body">
    {bugReport.bySeverity.map((b, i) => (
      <div key={i} className="report-row">
        <span>{b.severity}</span>
        <span className="count">{b._count.severity}</span>
      </div>
    ))}
  </div>
</div>

{/* ================= BUG BY PRIORITY ================= */}
<div className="report-box">
  <h3>Bug By Priority</h3>
  <div className="report-box-body">
    {bugReport.byPriority.map((b, i) => (
      <div key={i} className="report-row">
        <span>{b.priority}</span>
        <span className="count">{b._count.priority}</span>
      </div>
    ))}
  </div>
</div>

{/* ================= BUG BY DEVELOPER ================= */}
<div className="report-box">
  <h3>Bug By Developer</h3>
  <div className="report-box-body">
    {bugReport.byDeveloper.map((d, i) => (
      <div key={i} className="report-row">
        <span>{d.developer}</span>
        <span className="count">{d.count}</span>
      </div>
    ))}
  </div>
</div>

{/* ================= BUG AGING ================= */}
<div className="report-box">
  <h3>Bug Aging (Days Open)</h3>
  <div className="report-box-body">
    {bugReport.aging.map((a, i) => (
      <div key={i} className="report-row">
        <span>
          #{a.bugId} - {a.title}
        </span>
        <span className="count">{a.daysOpen} days</span>
      </div>
    ))}
  </div>
</div>

{/* ================= BUG TREND ================= */}
<div className="report-box">
  <h3>Bug Trend Over Time</h3>
  <div className="report-box-body">
    {bugReport.trend.map((t, i) => (
      <div key={i} className="report-row">
        <span>{t.date}</span>
        <span className="count">{t.count}</span>
      </div>
    ))}
  </div>
</div>

 </>
    )}
  </>
)}
{reportTab === "developer" && (
  <>
  <div className="report-section-box">
    <h2>Developer Performance Report</h2>

    {loadingDev && <p>Loading...</p>}

    {!loadingDev && Array.isArray(devReport) && (
      <table className="report-table">
        <thead>
          <tr>
            <th>Developer</th>
            <th>Assigned</th>
            <th>Resolved</th>
            <th>Avg Resolution (Days)</th>
            <th>Reopen %</th>
            <th>Fix Quality %</th>
          </tr>
        </thead>
        <tbody>
          {devReport.map((dev, i) => (
            <tr key={i}>
              <td>{dev.developer}</td>
              <td>{dev.assigned}</td>
              <td>{dev.resolved}</td>
              <td>{dev.avgResolutionDays}</td>
              <td>{dev.reopenRate}%</td>
              <td>{dev.fixQuality}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
  </>
)}

{reportTab === "tester" && (
  <>
  <div className="report-section-box">
    <h2>Tester Performance Report</h2>

    {loadingTester && <p>Loading...</p>}

    {!loadingTester && Array.isArray(testerReport) && (
      <table className="report-table">
        <thead>
          <tr>
            <th>Tester</th>
            <th>Total Executed</th>
            <th>Bugs Detected</th>
            <th>Detection Rate %</th>
            <th>Execution Efficiency %</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          {testerReport.map((t, i) => (
            <tr key={i}>
              <td>{t.tester}</td>
              <td>{t.totalExecuted}</td>
              <td>{t.bugsDetected}</td>
              <td>{t.detectionRate}%</td>
              <td>{t.efficiency}%</td>
              <td>{t.coverage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div> 
  </>
)}

      </div>
    </div>
  );
}