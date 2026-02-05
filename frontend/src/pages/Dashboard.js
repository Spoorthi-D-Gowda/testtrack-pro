import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const downloadReport = () => {
  window.open("http://localhost:5000/api/export/report");
};


  const navigate = useNavigate();

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
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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

      <button onClick={() => navigate("/testcases")}>
        Manage Test Cases
      </button>

      <br /><br />

      <button onClick={() => navigate("/bugs")}>
  Manage Bugs
</button>

<br /><br />

      <button onClick={logout}>Logout</button>

      <button onClick={() => navigate("/analytics")}>
  View Analytics
</button>

<br /><br />

<button onClick={downloadReport}>
  Download Report
</button>

<br /><br />


    </div>
  </div>
);


}
