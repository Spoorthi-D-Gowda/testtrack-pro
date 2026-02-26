import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../auth.css";

export default function TestRuns() {
const navigate = useNavigate();
  const [runs, setRuns] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTesters, setSelectedTesters] = useState([]);
    const [testCases, setTestCases] = useState([]);
const [selectedTestCases, setSelectedTestCases] = useState([]);
const [runCases, setRunCases] = useState([]);
const [selectedRunId, setSelectedRunId] = useState(null);
const [showPopup, setShowPopup] = useState(false);

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
const role =
  localStorage.getItem("role") ||
  sessionStorage.getItem("role");

  const fetchTestCases = useCallback(async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/testcases",
      { headers: { "x-auth-token": token } }
    );
    setTestCases(res.data);
  } catch (err) {
    console.error(err);
  }
}, [token]);
  // ================= FETCH USERS (TESTERS) =================
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/auth/users",
        {
          headers: { "x-auth-token": token },
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  // ================= FETCH TEST RUNS =================
  const fetchRuns = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/testruns",
        {
          headers: { "x-auth-token": token },
        }
      );
      setRuns(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [token]);

useEffect(() => {
  fetchRuns();
  fetchUsers();
  fetchTestCases();
}, [fetchRuns, fetchUsers, fetchTestCases]);

  // ================= CREATE TEST RUN =================
  const createRun = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/testruns",
        {
          name,
          description,
          startDate,
          endDate,
          testerIds: selectedTesters,
          testCaseIds: selectedTestCases, 
        },
        {
          headers: { "x-auth-token": token },
        }
      );

      alert("Test Run Created Successfully");

      setName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setSelectedTesters([]);

      fetchRuns();

    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create run");
    }
  };

  const toggleTester = (id) => {
    if (selectedTesters.includes(id)) {
      setSelectedTesters(selectedTesters.filter(t => t !== id));
    } else {
      setSelectedTesters([...selectedTesters, id]);
    }
  };

  // ================= GET PROGRESS =================
  const getProgress = async (runId) => {
    const res = await axios.get(
      `http://localhost:5000/api/testruns/${runId}/progress`,
      {
        headers: { "x-auth-token": token },
      }
    );
    return res.data;
  };

const openRunCases = async (runId) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/testruns/${runId}/testcases`,
      { headers: { "x-auth-token": token } }
    );

    setRunCases(res.data);
    setSelectedRunId(runId);
    setShowPopup(true);

  } catch (err) {
    alert("Failed to load test cases");
  }
};
const handleTestCaseSelect = (id) => {
  setSelectedTestCases((prev) =>
    prev.includes(id)
      ? prev.filter((tcId) => tcId !== id)
      : [...prev, id]
  );
};
const handleTesterSelect = (id) => {
  setSelectedTesters((prev) =>
    prev.includes(id)
      ? prev.filter((testerId) => testerId !== id)
      : [...prev, id]
  );
};
  return (
    <div className="auth-container">
      <div className="auth-card test-card">

        <h2>Test Run Management</h2>

        {/* ================= CREATE FORM ================= */}
    {role === "admin" && (
        <form onSubmit={createRun} style={{ marginBottom: "30px" }}>

          <input
            placeholder="Run Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          
<h4>Select Testers</h4>

<div className="selection-list">
  {users.map((tester) => (
    <label key={tester.id} className="selection-item">
      <input
        type="checkbox"
        value={tester.id}
        checked={selectedTesters.includes(tester.id)}
        onChange={() => handleTesterSelect(tester.id)}
      />

      <div className="selection-content">
        <span className="selection-title">
          {tester.name}
        </span>
        <span className="selection-sub">
          {tester.email}
        </span>
      </div>
    </label>
  ))}
</div>

              <h4>Select Test Cases</h4>

<div className="selection-list">
  {testCases.map((tc) => (
    <label key={tc.id} className="selection-item">
      <input
        type="checkbox"
        checked={selectedTestCases.includes(tc.id)}
        onChange={() => handleTestCaseSelect(tc.id)}
      />

      <div className="selection-content">
        <span className="selection-title">
          {tc.testCaseId}
        </span>
        <span className="selection-sub">
          {tc.title}
        </span>
      </div>
    </label>
  ))}
</div>

          <button type="submit" className="success-btn">
            Create Test Run
          </button>

        </form>
)}
        {/* ================= RUN LIST ================= */}
        <h3>All Test Runs</h3>

        {runs.length === 0 && <p>No test runs yet</p>}

        {runs.map((run) => (
          <div key={run.id} className="testcase-card">

            <div className="testcase-grid">
              <div className="field">
                <label>Name</label>
                <p>{run.name}</p>
              </div>

              <div className="field">
                <label>Start</label>
                <p>{new Date(run.startDate).toLocaleDateString()}</p>
              </div>

              <div className="field">
                <label>End</label>
                <p>{new Date(run.endDate).toLocaleDateString()}</p>
              </div>

              <div className="field">
                <label>Status</label>
                <p>{run.status}</p>
              </div>
            
             <div className="field">
                <label>Test cases</label>
                <p>{run.testCases?.length || 0}</p>
              </div>
            </div>

    <button
  className="secondary-btn"
  onClick={() => openRunCases(run.id)}
>
  View Test Cases
</button>

            <div style={{ marginTop: "10px" }}>
              <button
                className="primary-btn"
                onClick={async () => {
                  const progress = await getProgress(run.id);
                  alert(
                    `Progress: ${progress.progress}%\n` +
                    `Total: ${progress.total}\n` +
                    `Completed: ${progress.completed}\n` +
                    `Pass: ${progress.pass}\n` +
                    `Fail: ${progress.fail}\n` +
                    `Blocked: ${progress.blocked}`
                  );
                }}
              >
                View Progress
              </button>
            </div>

          </div>
        ))}

        {showPopup && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h3>Assigned Test Cases</h3>

      {runCases.length === 0 && <p>No test cases assigned</p>}

      {runCases.map(tc => (
        <div key={tc.id} className="modal-row">
          <div>
            {tc.testCaseId} - {tc.title}
          </div>

          <button
            className="primary-btn"
            
            onClick={() =>
              navigate(`/execute/${tc.id}?runId=${selectedRunId}`)
            }
          >
            Execute
          </button>
        </div>
      ))}

      <button onClick={() => setShowPopup(false)}>
        Close
      </button>
    </div>
  </div>
)}

      </div>
    </div>
  );
}