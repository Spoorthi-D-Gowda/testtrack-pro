import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import TestCasesManager from "./TestCases";
import TestSuites from "./TestSuites";
import TestRuns from "./TestRuns";
import Bugs from "./Bugs";
import ExecutionHistory from "./ExecutionHistory";
export default function Dashboard() {
  const [user, setUser] = useState(null);
 ;
  const [activeSection, setActiveSection] = useState("dashboard");
  const [testCaseTab, setTestCaseTab] = useState("create");
  const [showTestCaseMenu, setShowTestCaseMenu] = useState(false);

  const navigate = useNavigate();

  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role");

  const downloadReport = () => {
    window.open("http://localhost:5000/api/export/report");
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userId");

    navigate("/");
  }, [navigate]);

useEffect(() => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (!token) {
    navigate("/");
    return;
  }

  axios
    .get("http://localhost:5000/api/profile", {
      headers: {
        "x-auth-token": token,
      },
    })
    .then((res) => {
      setUser(res.data.user);
    })
    .catch((err) => {
      console.error("Dashboard error:", err);
      logout();
    });

}, [navigate, logout]);

  return (
    <div className="dashboard-wrapper">

      {/* LEFT SIDEBAR */}
      <div className="sidebar">
        <h2 className="logo">TestTrack Pro</h2>

        <button
  className="nav-btn active"
  onClick={() => {
    setActiveSection("dashboard");
    setTestCaseTab(null);
  }}
>
  Dashboard
</button>

        {(role === "tester" || role === "admin") && (
          <div>
  <button
    className="nav-btn"
    onClick={() => {
      setShowTestCaseMenu(!showTestCaseMenu);
    }}
  >
    Manage Test Cases
  </button>

{showTestCaseMenu && (
  <div className="sub-menu">
    <button
      className="sub-btn"
      onClick={() => {
        setActiveSection("testcases");
        setTestCaseTab("create");
      }}
    >
      Create Test Case
    </button>

    <button
      className="sub-btn"
      onClick={() => {
        setActiveSection("testcases");
        setTestCaseTab("view");
      }}
    >
      View Test Cases
    </button>

    <button
      className="sub-btn"
      onClick={() => {
        setActiveSection("testcases");
        setTestCaseTab("import");
      }}
    >
      Import Test Case
    </button>

    <button
      className="sub-btn"
      onClick={() => {
        setActiveSection("testcases");
        setTestCaseTab("templates");
      }}
    >
      View Templates
    </button>
  </div>
)}
</div>
        )}

{(role === "tester" || role === "admin") && (
  <button
    className={`nav-btn ${
      activeSection === "executions" ? "active" : ""
    }`}
    onClick={() => {
      setActiveSection("executions");
      setTestCaseTab(null);
    }}
  >
    Execution History
  </button>
)}
{(role === "tester" || role === "admin") && (
        <button 
         className="nav-btn"
         onClick={() => {
  setActiveSection("suites");
  setTestCaseTab("suites");
}}
    >
  Test Suites
</button>
)}
{(role === "tester" || role === "admin") && (
  <button
    className="nav-btn"
    onClick={() => {
      setActiveSection("testruns");
      setTestCaseTab(null);
    }}
  >
    Test Runs
  </button>
)}
{(role === "tester" || role === "admin") && (
  <button
              className="nav-btn"
              onClick={() => {
  setActiveSection("bugs");
  setTestCaseTab(null);
}}
            >
              Manage Bugs
            </button>
)}

        {role === "developer" && (
          <button
            className="nav-btn"
            onClick={() => {
  setActiveSection("mybugs");
  setTestCaseTab(null);
}}
          >
            My Assigned Bugs
          </button>
        )}

        {role === "admin" && (
          <>
            <button
              className="nav-btn"
              onClick={() => navigate("/analytics")}
            >
              View Analytics
            </button>

            <button
              className="nav-btn"
              onClick={downloadReport}
            >
              Download Report
            </button>
          </>
        )}

        <button
          className="nav-btn logout-btn"
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {/* RIGHT CONTENT */}
      <div className="main-content">

  {activeSection === "dashboard" && (
    !user ? (
      <div className="loading-overlay">
        <div className="blur-box">Loading...</div>
      </div>
    ) : (
      <>
        {/* USER INFO */}
        <div className="user-info">
          <h2>Welcome back,</h2>
          <h1>{user.email}</h1>
          <p className="role-text">{user.role}</p>
        </div>

        {/* ANALYTICS */}
        <div className="analytics-section">
          <h2>Analytics Overview</h2>
        
        </div>

      
      </>
    )
  )}

  {activeSection === "testcases" && (
  <TestCasesManager
    activeTab={testCaseTab}
    setTestCaseTab={setTestCaseTab}
    setActiveSection={setActiveSection}
  />
)}

{activeSection === "suites" && (
  <TestSuites />
)}
{activeSection === "testruns" && (
  <TestRuns />
)}
{activeSection === "bugs" && (
  <Bugs type="all" />
)}

{activeSection === "mybugs" && (
  <Bugs type="assigned" />
)}
{activeSection === "executions" && (
  <ExecutionHistory />
)}

</div>

    </div>
  );
}