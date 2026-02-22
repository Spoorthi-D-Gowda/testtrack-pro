import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import TestCasesManager from "./TestCases";
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentCases, setRecentCases] = useState([]);
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

        // Fetch recent testcases
        return axios.get(
          "http://localhost:5000/api/testcases",
          {
            headers: { "x-auth-token": token },
          }
        );
      })
      .then((res) => {
        setRecentCases(res.data.slice(0, 5));
      })
      .catch(() => {
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

        {role === "tester" && (
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

        {role === "developer" && (
          <button
            className="nav-btn"
            onClick={() => navigate("/bugs")}
          >
            My Assigned Bugs
          </button>
        )}

        {role === "admin" && (
          <>
            <button
              className="nav-btn"
              onClick={() => navigate("/testcases")}
            >
              Manage Test Cases
            </button>

            <button
              className="nav-btn"
              onClick={() => navigate("/bugs")}
            >
              Manage All Bugs
            </button>

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

        {/* RECENT TEST CASES */}
        <div className="recent-section">
          <div className="recent-header">
            <h3>TestCases</h3>
            <span
                  className="view-all"
                  onClick={() => navigate("/testcases")}
                >
                  View All
                </span>
          </div>

          <div className="recent-list">
            {recentCases.map((tc) => (
              <div key={tc.id} className="recent-item">
                <div>
                  <strong>{tc.testCaseId}</strong> — {tc.title}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                  {tc.module} | {tc.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  )}

  {activeSection === "testcases" && (
    <TestCasesManager activeTab={testCaseTab} />
  )}

</div>

    </div>
  );
}