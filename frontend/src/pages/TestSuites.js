import { useEffect, useState } from "react";
import axios from "axios";
import "../auth.css";

export default function TestSuites() {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const [suites, setSuites] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [selectedSuite, setSelectedSuite] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState("");
  const [parentId, setParentId] = useState("");

  const [selectedTestCaseId, setSelectedTestCaseId] = useState("");

  // ================= FETCH DATA =================
  const fetchSuites = async () => {
    const res = await axios.get("http://localhost:5000/api/suites", {
      headers: { "x-auth-token": token },
    });
    setSuites(res.data);
  };

  const fetchTestCases = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/testcases",
      {
        headers: { "x-auth-token": token },
      }
    );
    setTestCases(res.data);
  };

  useEffect(() => {
    fetchSuites();
    fetchTestCases();
  }, []);

  // ================= CREATE SUITE =================
  const createSuite = async (e) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:5000/api/suites",
      { name, description, module, parentId },
      { headers: { "x-auth-token": token } }
    );

    setName("");
    setDescription("");
    setModule("");
    setParentId("");

    fetchSuites();
  };

  // ================= ADD TEST CASE =================
  const addTestCaseToSuite = async () => {
    if (!selectedSuite || !selectedTestCaseId) return;

    await axios.post(
      `http://localhost:5000/api/suites/${selectedSuite.id}/add`,
      { testCaseId: Number(selectedTestCaseId) },
      { headers: { "x-auth-token": token } }
    );

    setSelectedTestCaseId("");
    fetchSuites();
  };

  // ================= HIERARCHY RENDER =================
  const renderSuiteTree = (suite, level = 0) => {
    return (
      <div key={suite.id} style={{ marginLeft: level * 20 }}>
        <div
          className="suite-card"
          onClick={() => setSelectedSuite(suite)}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            marginBottom: "5px",
            cursor: "pointer",
            background:
              selectedSuite?.id === suite.id ? "#e0f2fe" : "#f8fafc",
          }}
        >
          <b>{suite.name}</b>
          <div style={{ fontSize: "12px", color: "#555" }}>
            Module: {suite.module || "-"}
          </div>
        </div>

        {suite.children?.map((child) =>
          renderSuiteTree(child, level + 1)
        )}
      </div>
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card test-card">
        <h2>Test Suite Management</h2>

        {/* ================= CREATE FORM ================= */}
        <form onSubmit={createSuite} style={{ marginBottom: "20px" }}>
          <input
            placeholder="Suite Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            placeholder="Module"
            value={module}
            onChange={(e) => setModule(e.target.value)}
          />

          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">No Parent (Root Suite)</option>
            {suites.map((suite) => (
              <option key={suite.id} value={suite.id}>
                {suite.name}
              </option>
            ))}
          </select>

          <button type="submit" className="success-btn">
            Create Suite
          </button>
        </form>

        {/* ================= MAIN LAYOUT ================= */}
        <div style={{ display: "flex", gap: "20px" }}>
          {/* LEFT SIDE - TREE */}
          <div style={{ width: "40%" }}>
            <h3>Suite Hierarchy</h3>
            {suites
              .filter((s) => !s.parentId)
              .map((suite) => renderSuiteTree(suite))}
          </div>

          {/* RIGHT SIDE - DETAILS */}
          <div style={{ width: "60%" }}>
            {selectedSuite ? (
              <>
                <h3>{selectedSuite.name}</h3>
                <p>{selectedSuite.description}</p>

                <h4>Test Cases in Suite</h4>

                {selectedSuite.testCases?.length === 0 && (
                  <p>No test cases added yet.</p>
                )}

                <ul>
                  {selectedSuite.testCases?.map((item) => (
                    <li key={item.id}>
                      {item.testCase.testCaseId} -{" "}
                      {item.testCase.title}
                    </li>
                  ))}
                </ul>

                <h4>Add Test Case</h4>

                <select
                  value={selectedTestCaseId}
                  onChange={(e) =>
                    setSelectedTestCaseId(e.target.value)
                  }
                >
                  <option value="">Select Test Case</option>
                  {testCases.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.testCaseId} - {tc.title}
                    </option>
                  ))}
                </select>

                <button
                  onClick={addTestCaseToSuite}
                  className="primary-btn"
                >
                  Add to Suite
                </button>
              </>
            ) : (
              <p>Select a suite to view details</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}