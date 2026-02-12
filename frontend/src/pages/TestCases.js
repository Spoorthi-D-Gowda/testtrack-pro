import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../auth.css";
import { useNavigate } from "react-router-dom";

export default function TestCases() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistoryId, setShowHistoryId] = useState(null);

  const [title, setTitle] = useState("");
  const [module, setModule] = useState("");
  const [severity, setSeverity] = useState("");
  const [type, setType] = useState("");
  const [preconditions, setPreconditions] = useState("");
  const [testData, setTestData] = useState("");
  const [environment, setEnvironment] = useState("");

  const [description, setDescription] = useState("");

  const [expected, setExpected] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");


    const [stepsList, setStepsList] = useState([
  { action: "", testData: "", expected: "" }
]);

// Add new step
const addStep = () => {
  setStepsList([
    ...stepsList,
    { action: "", testData: "", expected: "" }
  ]);
};

// Update step
const updateStep = (index, field, value) => {
  const updated = [...stepsList];
  updated[index][field] = value;
  setStepsList(updated);
};

// Remove step
const removeStep = (index) => {
  const filtered = stepsList.filter((_, i) => i !== index);
  setStepsList(filtered);
};


  // ================= FETCH =================
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

  // ================= ADD / UPDATE =================
  const addCase = async (e) => {
  e.preventDefault();

  try {

    let res;

    if (editId) {
      // UPDATE
      res = await axios.put(
        `http://localhost:5000/api/testcases/${editId}`,
        {
          title,
          description,
          module,
          priority,
          severity,
          type,
          status,
          preconditions,
          testData,
          environment,
          steps: stepsList,
          expected,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      setEditId(null);

      alert(res.data.msg || "Updated successfully ✅");

    } else {
      // CREATE
      res = await axios.post(
        "http://localhost:5000/api/testcases",
        {
          title,
          description,
          module,
          priority,
          severity,
          type,
          status,

          preconditions,
          postconditions: "",
          cleanupSteps: "",

          testData,
          environment,

          tags: [],

          estimatedTime: "",

          automationStatus: "Not Automated",
          automationLink: "",

          steps: stepsList,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      alert(res.data.msg || "Added successfully ✅");
    }

    console.log("SERVER RESPONSE:", res.data);

    clearForm();
    fetchCases();

  } catch (err) {

    console.error("ADD/UPDATE ERROR:", err.response?.data);

    alert(
      err.response?.data?.msg ||
      "Something went wrong "
    );
  }
};
  // ================= CLEAR =================
  const clearForm = () => {
  setTitle("");
  setDescription("");
  setPriority("Medium");
  setStatus("Pending");
  setModule("");
  setSeverity("");
  setType("");
  setPreconditions("");
  setTestData("");
  setEnvironment("");

  // Reset steps (do NOT use tc here)
  setStepsList([
    { action: "", testData: "", expected: "" }
  ]);
};

  // ================= DELETE =================
const deleteCase = async (id) => {
  try {
    const res = await axios.delete(
      `http://localhost:5000/api/testcases/${id}`,
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    // Show success message
    alert(res.data.msg || "Deleted successfully ");

    fetchCases();

  } catch (err) {

    console.error("DELETE ERROR:", err.response?.data);

    // Show backend error if exists
    alert(
      err.response?.data?.msg ||
      "Failed to delete test case "
    );
  }
};

  // ================= CLONE =================
  const cloneCase = async (id) => {
    try {
      await axios.post(
        `http://localhost:5000/api/testcases/clone/${id}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      fetchCases();

    } catch (err) {
      alert("Clone failed ❌");
    }
  };

  // ================= EDIT =================
const editCase = (tc) => {
  setEditId(tc.id);

  setTitle(tc.title || "");
  setDescription(tc.description || "");
  setModule(tc.module || "");
  setSeverity(tc.severity || "");
  setType(tc.type || "");
  setPreconditions(tc.preconditions || "");
  setTestData(tc.testData || "");
  setEnvironment(tc.environment || "");
  setExpected(tc.expected || "");
  setPriority(tc.priority || "Medium");
  setStatus(tc.status || "Pending");

  // Load steps properly
  setStepsList(
    tc.steps && tc.steps.length > 0
      ? tc.steps.map((s) => ({
          action: s.action || "",
          testData: s.testData || "",
          expected: s.expected || "",
        }))
      : [{ action: "", testData: "", expected: "" }]
  );

  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Fetch History
const fetchHistory = async (id) => {
  try {

    const res = await axios.get(
      `http://localhost:5000/api/testcases/${id}/history`,
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    setHistory(res.data);
    setShowHistoryId(id);

  } catch (err) {
    alert("Failed to load history ❌");
  }
};


  // ================= UI =================
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
          <p style={{ color: "#38bdf8" }}>
            Editing Mode: Update the test case
          </p>
        )}

        {/* FORM */}
        <form onSubmit={addCase}>

          <input placeholder="Title" value={title}
            onChange={(e) => setTitle(e.target.value)} required />

          <input placeholder="Description" value={description}
            onChange={(e) => setDescription(e.target.value)} required />

          <input placeholder="Expected Result" value={expected}
            onChange={(e) => setExpected(e.target.value)} required />

          <input placeholder="Module" value={module}
            onChange={(e) => setModule(e.target.value)} required />

          <select value={priority}
            onChange={(e) => setPriority(e.target.value)}>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select value={severity}
            onChange={(e) => setSeverity(e.target.value)} required>
            <option value="">Select Severity</option>
            <option>Blocker</option>
            <option>Critical</option>
            <option>Major</option>
            <option>Minor</option>
            <option>Trivial</option>
          </select>

          <select value={type}
            onChange={(e) => setType(e.target.value)} required>
            <option value="">Select Type</option>
            <option>Functional</option>
            <option>Regression</option>
            <option>Smoke</option>
            <option>Integration</option>
            <option>Security</option>
            <option>Performance</option>
          </select>

          <select value={status}
            onChange={(e) => setStatus(e.target.value)}>
            <option>Pending</option>
            <option>Pass</option>
            <option>Fail</option>
          </select>

          <textarea placeholder="Preconditions"
            value={preconditions}
            onChange={(e) => setPreconditions(e.target.value)} />

          <textarea placeholder="Test Data"
            value={testData}
            onChange={(e) => setTestData(e.target.value)} />

          <textarea placeholder="Environment"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)} />

            <h4>Test Steps</h4>

{stepsList.map((step, index) => (

  <div
    key={index}
    style={{
      border: "1px solid #334155",
      padding: "10px",
      marginBottom: "10px",
      borderRadius: "6px",
    }}
  >

    <p><b>Step {index + 1}</b></p>

    <input
      placeholder="Action"
      value={step.action}
      onChange={(e) =>
        updateStep(index, "action", e.target.value)
      }
      required
    />

    <input
      placeholder="Test Data"
      value={step.testData}
      onChange={(e) =>
        updateStep(index, "testData", e.target.value)
      }
    />

    <input
      placeholder="Expected Result"
      value={step.expected}
      onChange={(e) =>
        updateStep(index, "expected", e.target.value)
      }
      required
    />

    {stepsList.length > 1 && (
      <button
        type="button"
        onClick={() => removeStep(index)}
        style={{
          background: "#dc2626",
          marginTop: "5px",
        }}
      >
        Remove Step
      </button>
    )}

  </div>
))}

<button
  type="button"
  onClick={addStep}
  style={{
    background: "#2563eb",
    marginBottom: "15px",
  }}
>
  + Add Step
</button>


          <button>
            {editId ? "Update Test Case" : "Add Test Case"}
          </button>

        </form>

        <hr />

        {/* SEARCH */}
        <input
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* LIST */}
        <h3>My Test Cases</h3>

        {cases.length === 0 && <p>No test cases yet</p>}

        {cases
          .filter((tc) =>
            tc.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((tc) => (

            <div key={tc.id}
              style={{
                border: "1px solid #334155",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "6px",
              }}
            >

              <h4>
  {tc.testCaseId} — {tc.title}
</h4>


              <p><b>Description:</b> {tc.description}</p>
              <p><b>Module:</b> {tc.module}</p>
              <p><b>Priority:</b> {tc.priority}</p>
              <p><b>Severity:</b> {tc.severity}</p>
              <p><b>Type:</b> {tc.type}</p>
              <p><b>Status:</b> {tc.status}</p>

              <p><b>Preconditions:</b> {tc.preconditions}</p>
              <p><b>Test Data:</b> {tc.testData}</p>
              <p><b>Environment:</b> {tc.environment}</p>

              <div>
  <b>Steps:</b>

  {tc.steps && tc.steps.length === 0 && (
    <p>No steps added</p>
  )}

  {tc.steps && tc.steps.map((step) => (
    <div
      key={step.id}
      style={{
        marginTop: "8px",
        padding: "6px",
        border: "1px solid #ccc",
        borderRadius: "4px",
      }}
    >
      <p><b>Step {step.stepNo}</b></p>

      <p>Action: {step.action}</p>

      {step.testData && (
        <p>Test Data: {step.testData}</p>
      )}

      <p>Expected: {step.expected}</p>

      {step.actual && (
        <p>Actual: {step.actual}</p>
      )}

      {step.status && (
        <p>Status: {step.status}</p>
      )}

      {step.notes && (
        <p>Notes: {step.notes}</p>
      )}
    </div>
  ))}
</div>

              <p><b>Expected:</b> {tc.expected}</p>

<div
  style={{
    display: "flex",
    gap: "15px",
    marginTop: "12px",
    flexWrap: "wrap",
  }}
>
  <button
    onClick={() => editCase(tc)}
    className="action-btn"
  >
    Edit
  </button>

  <button
    onClick={() => cloneCase(tc.id)}
    className="action-btn"
  >
    Clone
  </button>

  <button
    onClick={() => fetchHistory(tc.id)}
    className="action-btn"
  >
    History
  </button>

  <button
    onClick={() => deleteCase(tc.id)}
    className="action-btn"
  >
    Delete
  </button>
</div>


            </div>
          ))}

      </div>

          {/* Version History Panel */}
{showHistoryId && (
  <div
    style={{
      marginTop: "25px",
      padding: "15px",
      border: "1px solid #334155",
      borderRadius: "8px",
      background: "#020617",
    }}
  >

    <h3>Version History</h3>

    <button
      style={{
        float: "right",
        background: "transparent",
        color: "#38bdf8",
      }}
      onClick={() => setShowHistoryId(null)}
    >
      Close
    </button>

    {history.length === 0 && <p>No history found</p>}

    {history.map((h) => (

      <div
        key={h.id}
        style={{
          borderBottom: "1px solid #334155",
          padding: "10px 0",
        }}
      >

        <p><b>Version:</b> v{h.version}</p>
        <p><b>Summary:</b> {h.summary}</p>
        <p>
          <b>Edited By:</b> {h.editedBy.name} ({h.editedBy.email})
        </p>
        <p>
          <b>Date:</b>{" "}
          {new Date(h.createdAt).toLocaleString()}
        </p>

      </div>
    ))}
  </div>
)}


    </div>
  );
}
