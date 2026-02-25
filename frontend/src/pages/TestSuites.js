import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../auth.css";

export default function TestSuites() {

  const [suites, setSuites] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const activeSuites = suites.filter(s => !s.isArchived);
const archivedSuites = suites.filter(s => s.isArchived);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState("");
  const [parentId, setParentId] = useState("");
  const [selectedTestCases, setSelectedTestCases] = useState([]);
  const [newTestCaseId, setNewTestCaseId] = useState("");

   const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");
  const userRole =
  localStorage.getItem("role") ||
  sessionStorage.getItem("role");

  // ================= FETCH =================
const fetchSuites = useCallback(async () => {
  const res = await axios.get("http://localhost:5000/api/suites", {
    headers: { "x-auth-token": token },
  });
  setSuites(res.data);
}, [token]);

const fetchTestCases = useCallback(async () => {
  const res = await axios.get(
    "http://localhost:5000/api/testcases",
    { headers: { "x-auth-token": token } }
  );
  setTestCases(res.data);
}, [token]);

useEffect(() => {
  fetchSuites();
  fetchTestCases();
}, [fetchSuites, fetchTestCases]);

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
  return activeSuites
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
const addTestCaseToSuite = async () => {
  if (!newTestCaseId) return;

  await axios.post(
    `http://localhost:5000/api/suites/${selectedSuite.id}/add`,
    { testCaseId: Number(newTestCaseId) },
    { headers: { "x-auth-token": token } }
  );

  setNewTestCaseId("");
  fetchSuites();
};

const removeTestCase = async (testCaseId) => {
  await axios.delete(
    `http://localhost:5000/api/suites/${selectedSuite.id}/remove/${testCaseId}`,
    { headers: { "x-auth-token": token } }
  );

const res = await axios.get("http://localhost:5000/api/suites", {
  headers: { "x-auth-token": token },
});

setSuites(res.data);

const updated = res.data.find(s => s.id === selectedSuite.id);
setSelectedSuite(updated);
};
const reorder = async (id, direction) => {
  const items = [...selectedSuite.testCases];

  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return;

  if (direction === "up" && index > 0) {
    [items[index], items[index - 1]] = [
      items[index - 1],
      items[index],
    ];
  }

  if (direction === "down" && index < items.length - 1) {
    [items[index], items[index + 1]] = [
      items[index + 1],
      items[index],
    ];
  }

  const updated = items.map((item, idx) => ({
    id: item.id,
    order: idx + 1,
  }));

  await axios.put(
    `http://localhost:5000/api/suites/${selectedSuite.id}/reorder`,
    { items: updated },
    { headers: { "x-auth-token": token } }
  );

  // 🔥 REFRESH AND UPDATE SELECTED SUITE
  const res = await axios.get("http://localhost:5000/api/suites", {
    headers: { "x-auth-token": token },
  });

  setSuites(res.data);

  const refreshed = res.data.find(
    (suite) => suite.id === selectedSuite.id
  );

  setSelectedSuite(refreshed);
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
        {/* ================= SUITES SECTION ================= */}

<div style={{ marginTop: "40px" }}>

  <div
    style={{
      display: "flex",
      gap: "10px",
      alignItems: "flex-start",
    }}
  >

    {/* LEFT SIDE */}
    <div style={{ flex:  "0 0 50%"}}>
      <h3 style={{ marginBottom: "20px" }}>
        Suite Hierarchy
      </h3>

      <div style={{ display: "grid", gap: "15px" }}>
        {renderSuiteTree(null, 0)}
      </div>
    </div>


    {/* RIGHT SIDE */}
    {userRole === "admin" && (
      <div style={{ flex: 1 }}>
        <h3 style={{ marginBottom: "20px" }}>
          Archived Suites
        </h3>

        {archivedSuites.length === 0 && (
          <p style={{ color: "#64748b" }}>
            No archived suites.
          </p>
        )}

        <div style={{ display: "grid", gap: "20px" }}>
          {archivedSuites.map((suite) => (
            <div
              key={suite.id}
              className="auth-card"
              style={{
                padding: "15px",
                background: "#f8fafc",
                borderLeft: "4px solid #94a3b8",
              }}
            >
              <h4>{suite.name}</h4>
              <p style={{ color: "#64748b" }}>
                Module: {suite.module || "-"}
              </p>

              <button
                className="primary-btn"
                style={{ marginTop: "10px", width: "100%" }}
                onClick={async () => {
                  await axios.put(
                    `http://localhost:5000/api/suites/${suite.id}/restore`,
                    {},
                    { headers: { "x-auth-token": token } }
                  );
                  fetchSuites();
                }}
              >
                Restore Suite
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

  </div>

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
    {selectedSuite.testCases?.map((item, index) => (
  <div key={item.id} className="auth-card" style={{
    background: "#f8fafc",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}>
    <div>
      <strong>{item.testCase.testCaseId}</strong>
      <p style={{ marginTop: "5px" }}>
        {item.testCase.title}
      </p>
    </div>

    <div style={{ display: "flex", gap: "8px" }}>
      <button
        disabled={index === 0}
        onClick={() => reorder(item.id, "up")}
      >
        ↑
      </button>

      <button
        disabled={index === selectedSuite.testCases.length - 1}
        onClick={() => reorder(item.id, "down")}
      >
        ↓
      </button>

      <button
        className="danger-btn"
        onClick={() => removeTestCase(item.id)}
      >
        Remove
      </button>

  </div>
</div>
))}
            </div>

<h3 style={{ marginTop: "25px" }}>Add Test Case</h3>

<select
  style={{ width: "100%", marginTop: "10px" }}
  value={newTestCaseId}
  onChange={(e) => setNewTestCaseId(e.target.value)}
>
  <option value="">Select Test Case</option>
  {testCases.map((tc) => (
    <option key={tc.id} value={tc.id}>
      {tc.testCaseId} - {tc.title}
    </option>
  ))}
</select>

<button
  className="primary-btn"
  style={{ marginTop: "10px" }}
  onClick={addTestCaseToSuite}
>
  Add Test Case
</button>

            <button
  className="primary-btn"
  onClick={async () => {
    await axios.put(
      `http://localhost:5000/api/suites/${selectedSuite.id}/archive`,
      {},
      { headers: { "x-auth-token": token } }
    );
    fetchSuites();
    setSelectedSuite(null);
  }}
>
  Archive Suite
</button>
            <button
  className="primary-btn"
  onClick={async () => {
    await axios.post(
      `http://localhost:5000/api/suites/${selectedSuite.id}/clone`,
      {},
      { headers: { "x-auth-token": token } }
    );
    fetchSuites();
  }}
>
  Clone Suite
</button>
            <button
              className="primary-btn"
              style={{ marginTop: "10px" }}
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