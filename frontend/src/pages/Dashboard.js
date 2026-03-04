import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import TestCasesManager from "./TestCases";
import TestSuites from "./TestSuites";
import TestRuns from "./TestRuns";
import Bugs from "./Bugs";
import ExecutionHistory from "./ExecutionHistory";
import ExecutionCompare from "./ExecutionCompare";
import SuiteExecution from "./SuiteExecution";
import Reports from "./Reports";
import { useLocation } from "react-router-dom";
import ChangePassword from "./ChangePassword";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import CreateProject from "./CreateProject";
import MyAssignedProjects from "./MyAssignedProjects";
export default function Dashboard() {
  const [user, setUser] = useState(null);
 const [stats, setStats] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedCompareId, setSelectedCompareId] = useState(null);
  const [testCaseTab, setTestCaseTab] = useState("create");
  const [showTestCaseMenu, setShowTestCaseMenu] = useState(false);
  const [selectedSuiteExecutionId, setSelectedSuiteExecutionId] = useState(null);
  const [showReportsMenu, setShowReportsMenu] = useState(false);
const [reportTab, setReportTab] = useState("execution");
const [projects, setProjects] = useState([]);
const [selectedProject, setSelectedProject] = useState(
  localStorage.getItem("projectId") || ""
);
  const navigate = useNavigate();

  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role");

  const downloadReport = () => {
    window.open("http://localhost:5000/api/export/report");
  };

const logout = useCallback(() => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");

  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("userId");

  navigate("/");
}, [navigate]);

  const location = useLocation();

useEffect(() => {
  const fetchProjects = async () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    const res = await api.get(
      "http://localhost:5000/api/projects",
      {
        headers: { "x-auth-token": token },
      }
    );

    setProjects(res.data);

    if (!selectedProject && res.data.length > 0) {
      setSelectedProject(res.data[0].id);
      localStorage.setItem("projectId", res.data[0].id);
    }
  };

  fetchProjects();
}, []);

useEffect(() => {
  if (location.state?.activeSection) {
    setActiveSection(location.state.activeSection);
  }

  if (location.state?.suiteExecutionId) {
    setSelectedSuiteExecutionId(
      location.state.suiteExecutionId
    );
  }
}, [location]);

useEffect(() => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  if (!token) {
    navigate("/");
    return;
  }

  const fetchProfile = async () => {
    try {
      const res = await api.get(
        "http://localhost:5000/api/profile",
        {
          headers: { "x-auth-token": token },
        }
      );

      setUser(res.data.user);

    } catch (err) {
      console.error("Dashboard error:", err);

      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  fetchProfile();

}, [navigate, logout]);

useEffect(() => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  if (!token) return;

  api
    .get("http://localhost:5000/api/dashboard/stats", {
      headers: { "x-auth-token": token }
    })
    .then(res => setStats(res.data))
    .catch(err => console.error("Stats error:", err));

}, []);

useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      if (!token) return;

      await api.get("http://localhost:5000/api/profile", {
        headers: { "x-auth-token": token },
      });

    } catch (err) {
      console.log("Session invalidated");

      // 🔥 Auto logout if token invalid
      logout();
    }

  }, 10000); // check every 10 seconds

  return () => clearInterval(interval);

}, [logout]);

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
  {role === "tester" && (
  <button
    className="nav-btn"
    onClick={() => {
      setActiveSection("assignedProjects");
      setTestCaseTab(null);
    }}
  >
    My Assigned Projects
  </button>
)}
{role === "admin" && (
  <button
    className="nav-btn"
    onClick={() => {
      setActiveSection("assignedProjects");
      setTestCaseTab(null);
    }}
  >
    Ongoing Projects
  </button>
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
    {(role === "admin" || role === "tester") && (
           <button
  className="nav-btn"
  onClick={() => {
    setShowReportsMenu(!showReportsMenu);
    setTestCaseTab(null);
  }}
>
  Reports
</button>
   )}

{showReportsMenu && (
  <div className="sub-menu">

    {/* 1️⃣ Test Execution Report - Tester & Admin */}
    {(role === "admin" || role === "tester") && (
     <button
  className="sub-btn"
  onClick={() => {
    setActiveSection("reports");
    setReportTab("execution");
  }}
>
  Test Execution Report
</button>
    )}

    {/* 2️⃣ Bug Report - All Roles */}
    {(role === "admin" ||
      role === "tester") && (
      <button
        className="sub-btn"
        onClick={() => {
          setActiveSection("reports");
          setReportTab("bug");
        }}
      >
        Bug Report
      </button>
    )}

    {/* 3️⃣ Developer Performance Report - All Roles */}
    {(role === "admin" ||
      role === "tester") && (
      <button
        className="sub-btn"
        onClick={() => {
          setActiveSection("reports");
          setReportTab("developer");
        }}
      >
        Developer Performance Report
      </button>
    )}

    {/* 4️⃣ Tester Performance Report - Tester & Admin */}
    {(role === "admin" || role === "tester") && (
      <button
        className="sub-btn"
        onClick={() => {
          setActiveSection("reports");
          setReportTab("tester");
        }}
      >
        Tester Performance Report
      </button>
    )}

  </div>
)}

        <button
          className="nav-btn logout-btn"
          onClick={logout}
        >
          Logout
        </button>

        <button
  onClick={async () => {
    try {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      await api.post(
        "http://localhost:5000/api/auth/logout-all",
        {},
        {
          headers: { "x-auth-token": token },
        }
      );

      // 🔥 Clear current device
      localStorage.clear();
      sessionStorage.clear();

      alert("Logged out from all devices");

      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  }}
>
  Logout All Devices
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
  
        <div className="welcome-card">
  <div>
    <h2 className="welcome-title">Welcome back,</h2>
    <h1 className="welcome-name">{user.name || user.email}</h1>
    <p className="welcome-role">{user.role}</p>
  </div>

<button
  className="change-password-btn"
  onClick={() => {
    setActiveSection("changePassword");
    setTestCaseTab(null);
  }}
>
  Change Password
</button>

</div>



{role === "developer" && stats?.devStats && (
  <>
    {/* ===== ROW 1 - BUG COUNTERS ===== */}
    <div className="dashboard-top-cards">

      <div className="dash-card green">
        <p className="card-label">Bugs Assigned</p>
        <h2>{stats.devStats.bugsAssigned}</h2>
      </div>

      <div className="dash-card green">
        <p className="card-label">Bugs Resolved</p>
        <h2>{stats.devStats.bugsResolved}</h2>
      </div>

      <div className="dash-card green">
        <p className="card-label">Reopened Bugs</p>
        <h2>{stats.devStats.reopenedBugs}</h2>
      </div>

    </div>

    {/* ===== ROW 2 ===== */}
    <div className="middle-section">

      {/* Bug Severity */}
      <div className="widget-cards large">
        <h3>Bug Severity</h3>
        <div className="analytics-bars">
          {stats.devStats.severityStats.map((s, i) => (
            <div key={i} className="bar">
              <div
                className="bar-fill"
                style={{ height: `${s._count.severity * 20}px` }}
              />
              <span>{s.severity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bug Priority */}
      <div className="widget-cards large">
        <h3>Bug Priority</h3>
        <div className="analytics-bars">
          {stats.devStats.priorityStats.map((p, i) => (
            <div key={i} className="bar">
              <div
                className="bar-fill"
                style={{ height: `${p._count.priority * 20}px` }}
              />
              <span>{p.priority}</span>
            </div>
          ))}
        </div>
      </div>

    </div>

    {/* ===== ROW 3 - Assigned Test Cases ===== */}
    <div className="assigned-section">
      <div className="assigned-header">
        Assigned Test Cases
      </div>

      {stats.devStats.assignedTestCases.map(tc => (
        <div key={tc.id} className="assigned-item">
          <div className="assigned-title">{tc.title}</div>
          <div className="assigned-by">
            Assigned by: {tc.user?.name}
          </div>
        </div>
      ))}
    </div>
  </>
)}
{(role === "tester" || role === "admin") && (
      
        <div className="analytics-section">

  {/* TOP HEADER */}
  <div className="dashboard-header">
    <h2>Dashboard</h2>

    {role === "tester" && (
      <button
        className="add-btn"
        onClick={() => {
          setActiveSection("testcases");
          setTestCaseTab("create");
        }}
      >
        + Add Test Case
      </button>
    )}
    {role === "admin" && (
  <button
    className="add-btn"
    onClick={() => {
      setActiveSection("projects");
    }}
  >
    + Add Project
  </button>
)}
  </div>

  {stats && (
    <>
      {/* ===== TOP COUNTERS ===== */}
<div className="dashboard-top-cards">

  <div className="dash-card green">
    <div>
      <p className="card-label">Total Test Cases</p>
      <h2>{stats.totalTestCases}</h2>
    </div>
  </div>

  <div className="dash-card green">
    <p className="card-label">Total Bugs</p>
    <h2>{stats.totalBugs}</h2>
  </div>

  <div className="dash-card green">
    <p className="card-label">Passed</p>
    <h2>{stats.passedTestCases}</h2>
  </div>

  <div className="dash-card green">
    <p className="card-label">Failed</p>
    <h2>{stats.failedTestCases}</h2>
  </div>

</div>

      {/* ===== ANALYSIS + USERS ===== */}
      <div className="middle-section">
{role === "admin" && (
  <div
    style={{
      background: "#e6f6ff",
      padding: "20px",
      borderRadius: "12px",
      minHeight: "200px"
    }}
  >
    <h3>Projects</h3>

{projects.map((p) => (
  <div
    key={p.id}
    style={{
      padding: "12px",
      borderBottom: "1px solid #cce5ff"
    }}
  >
    <div style={{ fontWeight: "bold" }}>
      {p.name}
    </div>
  </div>
))}

  </div>
)}
 
       {/* Testers */}
<div className="widget-card">
  <h3>Testers</h3>
  <ul className="team-list">
    {stats.testers.map((t) => (
      <li key={t.id} className="team-item">
        <div className="team-name">{t.name}</div>
        <div className="team-email">{t.email}</div>
      </li>
    ))}
  </ul>
</div>
        {/* Developers */}
<div className="widget-card">
  <h3>Developers</h3>
  <ul className="team-list">
    {stats.developers.map((d) => (
      <li key={d.id} className="team-item">
        <div className="team-name">{d.name}</div>
        <div className="team-email">{d.email}</div>
      </li>
    ))}
  </ul>
</div>

{/* Admins - Only visible to admin dashboard */}
{role === "admin" && (
  <div className="widget-card">
    <h3>Admins</h3>
    <ul className="team-list">
      {stats.admins?.map(a => (
        <li key={a.id} className="team-item">
          <div className="team-name">{a.name}</div>
          <div className="team-email">{a.email}</div>
        </li>
      ))}
    </ul>
  </div> 
)}

       {/* Project Analysis */}
        <div className="widget-card large">
  <h3>Project Analytics</h3>

  <div className="analytics-bars">
    <div className="bar">
      <div
        className="bar-fill"
        style={{ height: `${stats.passedTestCases * 5}px` }}
      />
      <span>Passed</span>
    </div>

    <div className="bar">
      <div
        className="bar-fill"
        style={{ height: `${stats.failedTestCases * 5}px` }}
      />
      <span>Failed</span>
    </div>

    <div className="bar">
      <div
        className="bar-fill"
        style={{ height: `${stats.blockedTestCases * 5}px` }}
      />
      <span>Blocked</span>
    </div>

    <div className="bar">
      <div
        className="bar-fill"
        style={{ height: `${stats.skippedTestCases * 5}px` }}
      />
      <span>Skipped</span>
    </div>
  </div>
</div>

     </div>
      </>
    )}

  </div>
)}

      
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
  <TestSuites
    setActiveSection={setActiveSection}
    setSelectedSuiteExecutionId={setSelectedSuiteExecutionId}
  />
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
  <ExecutionHistory
    setActiveSection={setActiveSection}
    setSelectedCompareId={setSelectedCompareId}
  />
)}
{activeSection === "compare" && (
  <ExecutionCompare testCaseId={selectedCompareId} />
)}
{activeSection === "suiteExecution" && selectedSuiteExecutionId && (
  <SuiteExecution
    suiteExecutionId={selectedSuiteExecutionId}
  />
)}
{activeSection === "reports" && (
  <Reports reportTab={reportTab} />
)}
{activeSection === "changePassword" && (
  <ChangePassword />
)}
{activeSection === "projects" && (
  <CreateProject />
)}
{activeSection === "assignedProjects" && (
  <MyAssignedProjects
    setActiveSection={setActiveSection}
    setTestCaseTab={setTestCaseTab}
  />
)}
</div>

    </div>
  );
}