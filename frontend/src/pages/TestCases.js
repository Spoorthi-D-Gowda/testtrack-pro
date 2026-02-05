import { useEffect, useState, useCallback } from "react";

import axios from "axios";
import "../auth.css";
import { useNavigate } from "react-router-dom";

export default function TestCases() {
    const navigate = useNavigate();

  const [cases, setCases] = useState([]);
const [search, setSearch] = useState("");
const [editId, setEditId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [expected, setExpected] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  // Fetch Test Cases
  const fetchCases = useCallback(async () => {

    try {
      const res = await axios.get(
        "http://localhost:5000/api/testcases",
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      setCases(res.data);
    } catch (err) {
      console.error(err);
    }
 }, [token]);


 useEffect(() => {
  fetchCases();
}, [fetchCases]);


  // Add Test Case
 const addCase = async (e) => {
  e.preventDefault();

  try {

    if (editId) {
      // UPDATE
      await axios.put(
        `http://localhost:5000/api/testcases/${editId}`,
        {
          title,
          description,
          steps,
          expected,
          priority,
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
      // CREATE
      await axios.post(
        "http://localhost:5000/api/testcases",
        {
          title,
          description,
          steps,
          expected,
          priority,
          status,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
    }

    // Clear
    setTitle("");
    setDescription("");
    setSteps("");
    setExpected("");
    setPriority("Medium");
    setStatus("Pending");

    fetchCases();

  } catch (err) {
    alert("Operation failed ");
  }
};

  // Delete Test Case
  const deleteCase = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/testcases/${id}`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      fetchCases();
    } catch (err) {
      alert("Delete failed ❌");
    }
  };

// Load Data for Edit
const editCase = (tc) => {
  setEditId(tc.id);
  setTitle(tc.title);
  setDescription(tc.description);
  setSteps(tc.steps);
  setExpected(tc.expected);
  setPriority(tc.priority);
  setStatus(tc.status);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
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

  <h2>Test Case Management</h2>
</div>



        {editId && (
  <p style={{ color: "#38bdf8", marginBottom: "10px" }}>
    Editing Mode: Update the test case and save
  </p>
)}


        {/* Add Form */}
        <form onSubmit={addCase}>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <input
            placeholder="Steps"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            required
          />

          <input
            placeholder="Expected Result"
            value={expected}
            onChange={(e) => setExpected(e.target.value)}
            required
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Pending</option>
            <option>Pass</option>
            <option>Fail</option>
          </select>

          <button>
  {editId ? "Update Test Case" : "Add Test Case"}
</button>


        </form>

        <hr />

        <input
  placeholder="Search by title..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>


        {/* List */}
        <h3>My Test Cases</h3>

        {cases.length === 0 && <p>No test cases yet</p>}

        {cases
  .filter((tc) =>
    tc.title.toLowerCase().includes(search.toLowerCase())
  )
  .map((tc) => (

          <div
            key={tc.id}
            style={{
              border: "1px solid #334155",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >

            <h4>{tc.title}</h4>

            <p><b>Description:</b> {tc.description}</p>
            <p><b>Steps:</b> {tc.steps}</p>
            <p><b>Expected:</b> {tc.expected}</p>

            <p>
              <b>Priority:</b> {tc.priority} |{" "}
              <b>Status:</b> {tc.status}
            </p>

            <button
  onClick={() => editCase(tc)}
  style={{ background: "#2563eb", marginRight: "10px" }}
>
  Edit
</button>


            <button
              onClick={() => deleteCase(tc.id)}
              style={{ background: "#dc2626" }}
            >
              Delete
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}
