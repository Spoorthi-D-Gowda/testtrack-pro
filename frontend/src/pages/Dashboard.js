import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
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
      .catch(() => {
        logout();
      });

  }, [navigate, logout]); // ✅ Add logout here

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Dashboard</h2>

        {user && (
          <>
            <p>User ID: {user.id}</p>
            <p>Role: {user.role}</p>
          </>
        )}

        {role === "tester" && (
          <button onClick={() => navigate("/testcases")}>
            Manage Test Cases
          </button>
        )}

        {role === "developer" && (
          <button onClick={() => navigate("/bugs")}>
            My Assigned Bugs
          </button>
        )}

        {role === "admin" && (
          <>
            <button onClick={() => navigate("/testcases")}>
              Manage Test Cases
            </button>

            <br /><br />

            <button onClick={() => navigate("/bugs")}>
              Manage All Bugs
            </button>

            <br /><br />

            <button onClick={() => navigate("/analytics")}>
              View Analytics
            </button>

            <br /><br />

            <button onClick={downloadReport}>
              Download Report
            </button>
          </>
        )}

        <br /><br />

        <button onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );}