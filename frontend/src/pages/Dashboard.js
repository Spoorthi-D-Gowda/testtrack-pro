import { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";
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
import ProjectSettings from "./ProjectSettings";
import Milestones from "./Milestones";
import AdminUsers from "./AdminUsers";
import NotificationBell from "../components/NotificationBell";
import NotificationSettingsModal from "../components/NotificationSettingsModal";
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
const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
const [showProjects, setShowProjects] = useState(false);
const [showNotificationSettings,setShowNotificationSettings]
= useState(false);
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

  if (location.state?.testCaseTab) {
    setTestCaseTab(location.state.testCaseTab);
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
const executionData = stats
  ? [
      { name: "Passed", value: stats.passedTestCases },
      { name: "Failed", value: stats.failedTestCases },
      { name: "Blocked", value: stats.blockedTestCases },
      { name: "Skipped", value: stats.skippedTestCases }
    ]
  : [];

const bugTestData = stats
  ? [
      { name: "Test Cases", value: stats.totalTestCases },
      { name: "Bugs", value: stats.totalBugs }
    ]
  : [];

const trendData = stats
  ? [
      { name: "Passed", value: stats.passedTestCases },
      { name: "Failed", value: stats.failedTestCases },
      { name: "Blocked", value: stats.blockedTestCases }
    ]
  : [];

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
    <span className="arrow">›</span>
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
    Tester WorkSpace
    <span className="arrow">›</span>
  </button>
)}
{role === "admin" && (
  <button
    className="nav-btn"
    onClick={() => {
      setActiveSection("adminUsers");
    }}
  >
    Admin Workspace
    <span className="arrow">›</span>
  </button>
)}
  {(role === "tester" || role === "admin") && (
<button
  className="nav-btn"
  onClick={() => {
    setActiveSection("milestones");
    setTestCaseTab(null);
  }}
>
  Milestones
  <span className="arrow">›</span>
</button>
)}

{role === "admin" && (
  <button
    className="nav-btn"
    onClick={() => {
        setActiveSection("projects");
      }}
  >
    Current Projects
    <span className="arrow">›</span>
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
    <span className="arrow">›</span>
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
  <span className="arrow">›</span>
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
    <span className="arrow">›</span>
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
              <span className="arrow">›</span>
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
            Developer workspace
            <span className="arrow">›</span>
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
  <span className="arrow">›</span>
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
 {role === "admin" && (
  <button
    className="nav-btn"
    onClick={() => {
      setActiveSection("projectSettings");
      setTestCaseTab(null);
    }}
  >
    Project Settings
    <span className="arrow">›</span>
  </button>
)}
      </div>

      {/* RIGHT CONTENT */}
      <div className="main-content">
        {user && (
<div className="welcome-card">
  <div>
    <h2 className="welcome-title">Welcome back,</h2>
    <h1 className="welcome-name">{user.name || user.email}</h1>
    <p className="welcome-role">{user.role}</p>
  </div>
   <div className="header-center">

  <div className="project-dropdown">

    <div
      className="dropdown-selected"
      onClick={() => setShowProjects(!showProjects)}
    >
      {projects.find(p => p.id == selectedProject)?.name || "Select Project"}

      <span className={showProjects ? "arrow open" : "arrow"}>
        ▼
      </span>
    </div>

    {showProjects && (
      <div className="dropdown-list">
        {projects.map((p) => (
          <div
            key={p.id}
            className="dropdown-item"
            onClick={() => {
              setSelectedProject(p.id);
              localStorage.setItem("projectId", p.id);
              setShowProjects(false);   {/* close dropdown */}
              window.location.reload();
            }}
          >
            {p.name}
          </div>
        ))}
      </div>
    )}

  </div>

</div>
<div className="header-right">
<div style={{ display: "flex", alignItems: "center", gap: "15px" }}>

  <NotificationBell />

  <div className="profile-container">
    <div
  className="profile-icon"
  onClick={() => setShowProfileMenu(!showProfileMenu)}
>
 <svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  fill="white"
  viewBox="0 0 24 24"
>
  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z"/>
</svg>
</div>
     {showProfileMenu && (
      <div className="profile-dropdown">

        <button
          onClick={() => {
            setActiveSection("changePassword");
            setShowProfileMenu(false);
          }}
        >
          Change Password
        </button>

          <button
onClick={()=>{
setShowNotificationSettings(true);
setShowProfileMenu(false);
}}
>
Notification Settings
</button>

        <button onClick={logout}>
          Logout
        </button>

        <button
          onClick={async () => {
            const token =
              localStorage.getItem("accessToken") ||
              sessionStorage.getItem("accessToken");

            await api.post(
              "http://localhost:5000/api/auth/logout-all",
              {},
              { headers: { "x-auth-token": token } }
            );

            localStorage.clear();
            sessionStorage.clear();
            navigate("/");
          }}
        >
          Logout All Devices
        </button>
         </div>
    )}
  </div>
  </div>
</div>
 </div>
)}

{/* PAGE CONTENT */}

{activeSection === "dashboard" && (
  !user ? (
    <div className="loading-overlay">
      <div className="blur-box">Loading...</div>
    </div>
  ) : (
    <>
        
        
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

  {/* ACTION BUTTONS */}
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

{/* ===== DASHBOARD CHARTS ===== */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginTop: "30px"
  }}
>

{/* Execution Status Pie Chart */}

<div className="widget-card">
<h3>Execution Status</h3>

<ResponsiveContainer width="100%" height={250}>
<PieChart>
<Pie
data={executionData}
dataKey="value"
outerRadius={90}
label
>
<Cell fill="#22c55e" />
<Cell fill="#ef4444" />
<Cell fill="#f59e0b" />
<Cell fill="#64748b" />
</Pie>
<Tooltip />
</PieChart>
</ResponsiveContainer>

</div>


{/* Bugs vs Test Cases Bar Chart */}

<div className="widget-card">
<h3>Bugs vs Test Cases</h3>

<ResponsiveContainer width="100%" height={250}>
<BarChart data={bugTestData}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="name" />
<YAxis />
<Tooltip />
<Bar dataKey="value" fill="#2563eb" />
</BarChart>
</ResponsiveContainer>

</div>

</div>


{/* ===== EXECUTION TREND LINE ===== */}

<div
className="widget-card"
style={{ marginTop: "20px" }}
>
<h3>Execution Overview</h3>

<ResponsiveContainer width="100%" height={300}>
<LineChart data={trendData}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="name" />
<YAxis />
<Tooltip />
<Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} />
</LineChart>
</ResponsiveContainer>

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
{activeSection === "projectSettings" && (
  <ProjectSettings />
)}
{activeSection === "milestones" && (
  <Milestones />
)}
{activeSection === "adminUsers" && (
  <AdminUsers />
)}
{showNotificationSettings && (

<NotificationSettingsModal
onClose={()=>setShowNotificationSettings(false)}
/>

)}
</div>

    </div>
  );
}