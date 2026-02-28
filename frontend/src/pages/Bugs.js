import { useEffect, useState } from "react";
import axios from "axios";
import "../auth.css";

export default function Bugs({ type }) {

  const [bugs, setBugs] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
const [filterSeverity, setFilterSeverity] = useState("");
const [filterStatus, setFilterStatus] = useState("");
const [sortBy, setSortBy] = useState("");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const role =
  localStorage.getItem("role") ||
  sessionStorage.getItem("role");

  // ================= FETCH BUGS =================
const fetchBugs = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/bugs",
      {
        headers: { "x-auth-token": token },
         params: {
          priority: filterPriority || undefined,
          severity: filterSeverity || undefined,
          status: filterStatus || undefined,
          sortBy: sortBy || undefined,
        },
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
const updateStatus = async (id, status, fixNotes, commitLink, rejectionReason) => {
  try {
    const res = await axios.put(
      `http://localhost:5000/api/bugs/status/${id}`,
      { status, fixNotes, commitLink, rejectionReason },
      { headers: { "x-auth-token": token } }
    );

    alert(res.data.msg);
    fetchBugs();

  } catch (err) {
    alert(err.response?.data?.msg || "Failed to update status");
  }
};
  return (
    <div className="auth-container">
      <div className="auth-card test-card">

      <div className="filter-box">

  <div className="filter-item">
    <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
      <option value="">Priority</option>
      <option value="P1_Urgent">P1 Urgent</option>
      <option value="P2_High">P2 High</option>
      <option value="P3_Medium">P3 Medium</option>
      <option value="P4_Low">P4 Low</option>
    </select>
  </div>

  <div className="divider"></div>

  <div className="filter-item">
    <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
      <option value="">Severity</option>
      <option value="Blocker">Blocker</option>
      <option value="Critical">Critical</option>
      <option value="Major">Major</option>
      <option value="Minor">Minor</option>
      <option value="Trivial">Trivial</option>
    </select>
  </div>

  <div className="divider"></div>

  <div className="filter-item">
    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
      <option value="">Status</option>
      <option value="New">New</option>
      <option value="Open">Open</option>
      <option value="In_Progress">In Progress</option>
      <option value="Fixed">Fixed</option>
      <option value="Verified">Verified</option>
      <option value="Closed">Closed</option>
      <option value="Reopened">Reopened</option>
    </select>
  </div>

  <div className="divider"></div>

  <div className="filter-item">
    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
      <option value="">Sort By</option>
      <option value="priority">Priority</option>
      <option value="age">Oldest First</option>
    </select>
  </div>

  <button className="apply-btn" onClick={fetchBugs}>
    Apply
  </button>

</div>

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

{bug.fixNotes && (
  <div className="field">
    <label>Fix Notes</label>
    <p>{bug.fixNotes}</p>
  </div>
)}

{bug.commitLink && (
  <div className="field">
    <label>Commit</label>
    <p>{bug.commitLink}</p>
  </div>
)}

    </div>
  )}
<div className="card-actions">
{role === "developer" &&
  (bug.status === "Open" || bug.status === "Reopened") && (
   <>
  <button
    className="small-action-btn execute-btn"
    onClick={() => updateStatus(bug.id, "In_Progress")}
  >
    Start Work
  </button>

    {bug.status === "Open" && (
      <button
        className="small-action-btn"
        onClick={() => {
          const reason = prompt("Enter reason for rejection:");
          if (!reason) return;
          updateStatus(bug.id, "Wont_Fix", null, null, reason);
        }}
      >
        Won't Fix
      </button>
    )}
     </>
)}


{role === "developer" && bug.status === "In_Progress" && (
  <button
    className="small-action-btn execute-btn"
    onClick={() => {
      const fixNotes = prompt("Enter fix notes:");
      const commitLink = prompt("Enter commit link:");
      updateStatus(bug.id, "Fixed", fixNotes, commitLink);
    }}
  >
    Mark Fixed
  </button>
)}
{role === "tester" && bug.status === "Fixed" && (
  <>
    <button 
    className="small-action-btn"
    onClick={() => updateStatus(bug.id, "Verified")}>
      Verify
    </button>
    <button 
    className="small-action-btn execute-btn"
    onClick={() => updateStatus(bug.id, "Reopened")}>
      Reopen
    </button>
  </>
)}
{role === "admin" && bug.status === "Verified" && (
  <button onClick={() => updateStatus(bug.id, "Closed")}>
    Close
  </button>
)}
</div>
</div>
        ))}

      </div>
    </div>
  );
}