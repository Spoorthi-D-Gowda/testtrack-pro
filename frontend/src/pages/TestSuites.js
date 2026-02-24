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
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState("");
  const [parentId, setParentId] = useState("");
  const [selectedTestCases, setSelectedTestCases] = useState([]);

  // ================= FETCH =================
  const fetchSuites = async () => {
    const res = await axios.get("http://localhost:5000/api/suites", {
      headers: { "x-auth-token": token },
    });
    setSuites(res.data);
  };

  const fetchTestCases = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/testcases",
      { headers: { "x-auth-token": token } }
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
  {
    name,
    description,
    module,
    parentId: parentId ? Number(parentId) : null,
    testCaseIds: selectedTestCases,
  },
      { headers: { "x-auth-token": token } }
    );

    setName("");
    setDescription("");
    setModule("");
    setParentId("");
    setSelectedTestCases([]);

    fetchSuites();
  };

const renderSuiteTree = (parentId = null, level = 0) => {
  return suites
    .filter((suite) => suite.parentId === parentId)
    .map((suite) => (
      <div key={suite.id}>
        <div
          className="auth-card suite-tree-card"
          style={{
            marginLeft: level * 25,
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer"
          }}
          onClick={() => setSelectedSuite(suite)}
        >
          <h4 style={{ fontSize: "15px", marginBottom: "4px" }}>
            {suite.name}
          </h4>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Module: {suite.module || "-"}
          </p>
        </div>

        {renderSuiteTree(suite.id, level + 1)}
      </div>
    ));
};

  return (
    <div className="auth-container">
      <div className="auth-card test-card">
        <h2>Test Suite Management</h2>

        {/* ================= CREATE FORM ================= */}
        <form onSubmit={createSuite} style={{ marginBottom: "25px" }}>
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

          <button
            type="button"
            className="primary-btn"
            onClick={() => setShowModal(true)}
          >
            Select Test Cases ({selectedTestCases.length})
          </button>

          <button type="submit" className="success-btn">
            Create Suite
          </button>
        </form>

        {/* ================= SUITE LIST ================= */}
       <h3 style={{ marginBottom: "10px" }}>Suite Hierarchy</h3>

<div>
  {renderSuiteTree(null, 0)}
</div>
      </div>

       {/* ================= TEST CASE SELECT MODAL ================= */}
      {showModal && (
        <div
          className="popup-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="suite-popup-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Select Test Cases</h3>

            <div className="modal-list">
              {testCases.map((tc) => (
                <div
                  key={tc.id}
                  className="modal-row"
                  onClick={() => {
                    if (selectedTestCases.includes(tc.id)) {
                      setSelectedTestCases(
                        selectedTestCases.filter(
                          (id) => id !== tc.id
                        )
                      );
                    } else {
                      setSelectedTestCases([
                        ...selectedTestCases,
                        tc.id,
                      ]);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTestCases.includes(tc.id)}
                    readOnly
                  />

                  <div className="tc-id">
                    {tc.testCaseId}
                  </div>

                  <div className="tc-title">
                    {tc.title}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="black-btn"
              onClick={() => setShowModal(false)}
            >
              Done
            </button>

          </div>
        </div>
      )}
      {/* ================= SUITE DETAILS POPUP ================= */}
      {selectedSuite && (
        <div
          className="popup-overlay"
          onClick={() => setSelectedSuite(null)}
        >
          <div
            className="auth-card"
            style={{ width: "750px", maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selectedSuite.name}</h2>
            <p>{selectedSuite.description}</p>

            <h3 style={{ marginTop: "20px" }}>Test Cases in Suite</h3>

            {selectedSuite.testCases?.length === 0 && (
              <p>No test cases added.</p>
            )}

            <div style={{ display: "grid", gap: "10px", marginTop: "15px" }}>
              {selectedSuite.testCases?.map((item) => (
                <div
                  key={item.id}
                  className="auth-card"
                  style={{ background: "#f8fafc" }}
                >
                  <strong>{item.testCase.testCaseId}</strong>
                  <p style={{ marginTop: "5px" }}>
                    {item.testCase.title}
                  </p>
                </div>
              ))}
            </div>

            <button
              className="primary-btn"
              style={{ marginTop: "20px" }}
              onClick={() => setSelectedSuite(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}