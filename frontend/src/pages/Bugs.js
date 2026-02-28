import { useEffect, useState } from "react";
import axios from "axios";
import "../auth.css";

export default function Bugs({ type }) {

  const [bugs, setBugs] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState("");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // ================= FETCH BUGS =================
const fetchBugs = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/bugs",
      {
        headers: { "x-auth-token": token },
      }
    );

    const role =
  localStorage.getItem("role") ||
  sessionStorage.getItem("role");

   setBugs(res.data);

  } catch (err) {
    console.error("FETCH BUGS ERROR:", err);
  }
};

  // ================= FETCH DEVELOPERS =================
const fetchDevelopers = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/auth/users",
      {
        headers: { "x-auth-token": token },
      }
    );

    console.log("Users response:", res);        // log full response
    console.log("Users data:", res.data);       // safe now

    const devs = res.data.filter(
      (user) => user.role === "developer"
    );

    setDevelopers(devs);

  } catch (err) {
    console.error("Failed to fetch developers:");
    console.error(err.response?.status);
    console.error(err.response?.data);
  }
};

useEffect(() => {
  fetchBugs();

  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role");

  if (role === "admin" || role === "tester") {
    fetchDevelopers();
  }

}, []);

  // ================= ASSIGN BUG =================
  const assignBug = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/bugs/assign/${selectedBugId}`,
        { developerId: Number(selectedDeveloper) },
        {
          headers: { "x-auth-token": token },
        }
      );

      alert("Bug assigned successfully");

      setSelectedBugId(null);
      setSelectedDeveloper("");

      fetchBugs();

    } catch (err) {
      alert(err.response?.data?.msg || "Failed to assign bug");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card test-card">
        <h2>Bug Management</h2>

        {bugs.length === 0 && <p>No bugs found</p>}

        {bugs.map((bug) => (
          <div key={bug.id} className="testcase-card">

  <h4 style={{ marginBottom: "10px" }}>{bug.title}</h4>

  <div className="bug-grid">
    <div className="field">
      <label>Status</label>
      <p>{bug.status}</p>
    </div>

    <div className="field">
      <label>Priority</label>
      <p>{bug.priority}</p>
    </div>

    <div className="field">
      <label>Severity</label>
      <p>{bug.severity}</p>
    </div>

    <div className="field">
      <label>Reported By</label>
      <p>{bug.reportedBy?.name}</p>
    </div>

    <div className="field">
      <label>Assigned To</label>
      <p>{bug.assignedTo?.name || "-"}</p>
    </div>
  </div>

  {/* Assign button section */}
  {!bug.assignedTo && (
    <div className="bug-action-row">
      <button
        className="execute-btn"
        onClick={() => setSelectedBugId(bug.id)}
      >
        Assign Developer
      </button>
    </div>
  )}

  {selectedBugId === bug.id && (
    <div className="assign-row">
      <select
        value={selectedDeveloper}
        onChange={(e) => setSelectedDeveloper(e.target.value)}
      >
        <option value="">Select Developer</option>
        {developers.map((dev) => (
          <option key={dev.id} value={dev.id}>
            {dev.name}
          </option>
        ))}
      </select>

      <button
        className="reexecute-btn"
        onClick={assignBug}
        disabled={!selectedDeveloper}
      >
        Confirm
      </button>
    </div>
  )}
</div>
        ))}

      </div>
    </div>
  );
}