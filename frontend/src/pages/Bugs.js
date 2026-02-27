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

    if (type === "assigned") {
      setBugs(res.data.filter(b => b.assignedTo));
    } else {
      setBugs(res.data);
    }

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

      const devs = res.data.filter(
        (user) => user.role === "developer"
      );

      setDevelopers(devs);

    } catch (err) {
      console.error("Failed to fetch developers:", err);
    }
  };

useEffect(() => {
  fetchBugs();

  const role = JSON.parse(
    localStorage.getItem("user")
  )?.role;

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
          <div key={bug.id} className="step-card">

            <h4>{bug.title}</h4>

            <p><b>Status:</b> {bug.status}</p>
            <p><b>Priority:</b> {bug.priority}</p>
            <p><b>Severity:</b> {bug.severity}</p>
            <p><b>Reported By:</b> {bug.reportedBy?.name}</p>

            {bug.assignedTo && (
              <p><b>Assigned To:</b> {bug.assignedTo.name}</p>
            )}

            {!bug.assignedTo && (
              <>
                <button
                  className="primary-btn"
                  onClick={() => setSelectedBugId(bug.id)}
                >
                  Assign Developer
                </button>

                {selectedBugId === bug.id && (
                  <div style={{ marginTop: "10px" }}>
                    <select
                      value={selectedDeveloper}
                      onChange={(e) =>
                        setSelectedDeveloper(e.target.value)
                      }
                    >
                      <option value="">
                        Select Developer
                      </option>
                      {developers.map((dev) => (
                        <option
                          key={dev.id}
                          value={dev.id}
                        >
                          {dev.name}
                        </option>
                      ))}
                    </select>

                    <button
                      className="success-btn"
                      onClick={assignBug}
                      disabled={!selectedDeveloper}
                      style={{ marginLeft: "10px" }}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}