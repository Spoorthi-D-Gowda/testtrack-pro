import { useEffect, useState } from "react";
import axios from "axios";
import "../auth.css";

export default function Analytics() {

  const [stats, setStats] = useState({});

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/dashboard/stats",
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      setStats(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card test-card">

        <h2>Analytics Dashboard</h2>

        <div className="stats-box">

          <p>Total Tests: {stats.totalTests}</p>
          <p>Passed: {stats.passTests}</p>
          <p>Failed: {stats.failTests}</p>
          <p>Pending: {stats.pendingTests}</p>

          <hr />

          <p>Total Bugs: {stats.totalBugs}</p>
          <p>Open Bugs: {stats.openBugs}</p>
          <p>Closed Bugs: {stats.closedBugs}</p>

        </div>

      </div>
    </div>
  );
}
