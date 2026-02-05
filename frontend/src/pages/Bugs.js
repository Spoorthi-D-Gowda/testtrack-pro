import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../auth.css";
import { useNavigate } from "react-router-dom";

export default function Bugs() {
    const navigate = useNavigate();

  const [bugs, setBugs] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [status, setStatus] = useState("Open");

  const [editId, setEditId] = useState(null);

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // Fetch Bugs
  const fetchBugs = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/bugs",
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      setBugs(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  useEffect(() => {
    fetchBugs();
  }, [fetchBugs]);

  // Add / Update Bug
  const saveBug = async (e) => {
    e.preventDefault();

    try {

      if (editId) {
        // Update
        await axios.put(
          `http://localhost:5000/api/bugs/${editId}`,
          {
            title,
            description,
            severity,
            status,
          },
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        setEditId(null);

      } else {
        // Create
        await axios.post(
          "http://localhost:5000/api/bugs",
          {
            title,
            description,
            severity,
            status,
          },
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );
      }

      // Clear form
      setTitle("");
      setDescription("");
      setSeverity("Medium");
      setStatus("Open");

      fetchBugs();

    } catch (err) {
      alert("Operation failed ❌");
    }
  };

  // Edit Bug
  const editBug = (bug) => {
    setEditId(bug.id);
    setTitle(bug.title);
    setDescription(bug.description);
    setSeverity(bug.severity);
    setStatus(bug.status);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete Bug
  const deleteBug = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/bugs/${id}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      fetchBugs();

    } catch (err) {
      alert("Delete failed ");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card test-card">

        <div className="page-header">
 <span
  className="back-link"
  onClick={() => navigate("/dashboard")}
>
  ← Dashboard
</span>


  <h2>Bug Tracker</h2>
</div>


        {editId && (
          <p style={{ color: "#38bdf8" }}>
            Editing Bug - Update and Save
          </p>
        )}

        <form onSubmit={saveBug}>

          <input
            placeholder="Bug Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            placeholder="Bug Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>

          <button>
            {editId ? "Update Bug" : "Report Bug"}
          </button>

        </form>

        <hr />

        <h3>My Bugs</h3>

        {bugs.length === 0 && <p>No bugs reported</p>}

        {bugs.map((bug) => (
          <div
            key={bug.id}
            style={{
              border: "1px solid #334155",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >

            <h4>{bug.title}</h4>

            <p>{bug.description}</p>

            <p>
              <b>Severity:</b> {bug.severity} |{" "}
              <b>Status:</b> {bug.status}
            </p>

            <button
              onClick={() => editBug(bug)}
              style={{
                background: "#2563eb",
                marginRight: "10px",
              }}
            >
              Edit
            </button>

            <button
              onClick={() => deleteBug(bug.id)}
              style={{ background: "#fe6f6f" }}
            >
              Delete
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}
