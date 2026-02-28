import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../auth.css";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

export default function TestCasesManager({
  activeTab,
  setTestCaseTab,
  setActiveSection
}){
  const [cases, setCases] = useState({
  active: [],
  deleted: [],
});
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistoryId, setShowHistoryId] = useState(null);
  const [executionData, setExecutionData] = useState({});

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
  const [templates, setTemplates] = useState([]);
  const [selectedCases, setSelectedCases] = useState([]);

  const [importFile, setImportFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [previewTotal, setPreviewTotal] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const role =
  localStorage.getItem("role") ||
  sessionStorage.getItem("role");

  const [stepsList, setStepsList] = useState([
  { action: "", testData: "", expected: "" }
]);
console.log("TOKEN:", token);

const fetchTemplates = useCallback(async () => {

  try {

    const res = await axios.get(
      "http://localhost:5000/api/testcases/templates/all",
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    setTemplates(res.data);

  } catch (err) {

    alert("Failed to load templates");

  }

}, [token]);

useEffect(() => {
  if (activeTab === "templates") {
    fetchTemplates();
  }
}, [activeTab, fetchTemplates]);

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

    const activeRes = await axios.get(
      `http://localhost:5000/api/testcases?title=${search}`,
      {
        headers: { "x-auth-token": token },
      }
    );

    const deletedRes = await axios.get(
      `http://localhost:5000/api/testcases?deleted=true&title=${search}`,
      {
        headers: { "x-auth-token": token },
      }
    );

    setCases({
      active: activeRes.data,
      deleted: deletedRes.data,
    });

  } catch (err) {
    console.error(err);
  }
}, [token, search]);


 useEffect(() => {
  if (!token) return;

  const delayDebounce = setTimeout(() => {
    fetchCases();
  }, 400);

  return () => clearTimeout(delayDebounce);
}, [search, token]);

  // ================= ADD / UPDATE =================
  const addCase = async (e) => {
  e.preventDefault();

  try {

    let res;

    if (editId) {
      // UPDATE
     const formData = new FormData();

formData.append("title", title);
formData.append("description", description);
formData.append("module", module);
formData.append("priority", priority);
formData.append("severity", severity);
formData.append("type", type);
formData.append("status", status);
formData.append("preconditions", preconditions);
formData.append("testData", testData);
formData.append("environment", environment);
formData.append("expected", expected);
formData.append("steps", JSON.stringify(stepsList));

// Append selected files
selectedFiles.forEach(file => {
  formData.append("attachments", file);
});

res = await axios.put(
  `http://localhost:5000/api/testcases/${editId}`,
  formData,
  {
    headers: {
      "x-auth-token": token,
      "Content-Type": "multipart/form-data",
    },
  }
);

      setEditId(null);

      alert(res.data.msg || "Updated successfully ");
      setActiveSection("testcases");
setTestCaseTab("view");

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
          expected,
        },
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      alert(res.data.msg || "Added successfully ");
      setActiveSection("testcases");
setTestCaseTab("view");
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
const cloneCase = async (id, includeAttachments) => {
  try {
    await axios.post(
      `http://localhost:5000/api/testcases/clone/${id}`,
      { includeAttachments },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    fetchCases();

  } catch (err) {
    alert("Clone failed ");
  }
};


const selectAllCases = () => {

  const activeCases = cases.active;

  if (selectedCases.length === activeCases.length) {
    setSelectedCases([]);
  } else {
    setSelectedCases(activeCases.map(tc => tc.id));
  }

};



  const applyTemplate = async (templateId) => {

  try {

    const res = await axios.post(
      `http://localhost:5000/api/testcases/templates/use/${templateId}`,
      {},
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    alert(res.data.msg || "Created from template");

    fetchCases();

  } catch (err) {

    alert(
      err.response?.data?.msg ||
      "Failed to use template"
    );

  }

};


  const saveTemplate = async (id) => {

  try {

    const res = await axios.post(
      `http://localhost:5000/api/testcases/${id}/template`,
      {},
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    alert(res.data.msg || "Template saved successfully");

  } catch (err) {

    alert(
      err.response?.data?.msg ||
      "Failed to save template"
    );

  }

};

  // ================= UPDATE STEP EXECUTION =================
const updateStepExecution = async (stepId, stepData) => {

  try {

    const res = await axios.put(

      `http://localhost:5000/api/testcases/step/${stepId}`,

      {
        actual: stepData.actual,
        status: stepData.status,
        notes: stepData.notes,
      },

      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    alert(res.data.msg || "Step updated successfully ");

    fetchCases();

  } catch (err) {

    alert(
      err.response?.data?.msg ||
      "Failed to update step "
    );

  }

};

const handleExecutionChange = (stepId, field, value) => {

  setExecutionData({

    ...executionData,

    [stepId]: {

      ...executionData[stepId],

      [field]: value,

    },

  });

};
const toggleSelectCase = (id) => {

  if (selectedCases.includes(id)) {
    setSelectedCases(
      selectedCases.filter(cid => cid !== id)
    );
  } else {
    setSelectedCases(
      [...selectedCases, id]
    );
  }

};
const selectedTestCase = cases.active.find(
  (tc) => tc.id === showHistoryId
);

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

   setActiveSection("testcases");
setTestCaseTab("create");

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
    alert("Failed to load history ");
  }
};

 const bulkDelete = async () => {

  if (selectedCases.length === 0) {
    alert("Select test cases first");
    return;
  }

  if (!window.confirm(
    `Are you sure you want to delete ${selectedCases.length} test cases?`
  )) {
    return;
  }
  try {

    const res = await axios.post(
      "http://localhost:5000/api/testcases/bulk/delete",
      { ids: selectedCases },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    alert(res.data.msg);

    setSelectedCases([]);

    fetchCases();

  } catch (err) {

    alert(
      err.response?.data?.msg ||
      "Bulk delete failed"
    );

  }

};

const bulkStatusUpdate = async (status) => {

  if (selectedCases.length === 0) {
    alert("Select test cases first");
    return;
  }

  try {

    const res = await axios.post(
      "http://localhost:5000/api/testcases/bulk/status",
      {
        ids: selectedCases,
        status,
      },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    alert(res.data.msg);

    setSelectedCases([]);

    fetchCases();

  } catch (err) {

    alert(
      err.response?.data?.msg ||
      "Bulk update failed"
    );

  }

};

const bulkExport = async () => {

  if (selectedCases.length === 0) {
    alert("Select test cases first");
    return;
  }

  try {

    const res = await axios.post(
      "http://localhost:5000/api/testcases/bulk/export",
      { ids: selectedCases },
      {
        headers: {
          "x-auth-token": token,
        },
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(
      new Blob([res.data])
    );

    const link = document.createElement("a");

    link.href = url;

    link.setAttribute(
      "download",
      "testcases.csv"
    );

    document.body.appendChild(link);

    link.click();

  } catch (err) {

    alert("Export failed");

  }

};

const confirmImport = async () => {

  if (!importFile) {

    alert("Select file first");
    return;

  }

  const formData = new FormData();

  formData.append("file", importFile);

  try {

    const res = await axios.post(
      "http://localhost:5000/api/testcases/import",
      formData,
      {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    alert(
      `Import Completed\nCreated: ${res.data.created}\nFailed: ${res.data.failed}`
    );

    setShowPreview(false);
    setImportFile(null);

    fetchCases();

  }

  catch (err) {

    alert(
      err.response?.data?.msg ||
      "Import failed"
    );

  }

};

const previewImport = async () => {

  if (!importFile) {

    alert("Select file first");
    return;

  }

  const formData = new FormData();

  formData.append("file", importFile);

  try {

    const res = await axios.post(
      "http://localhost:5000/api/testcases/import/preview",
      formData,
      {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data"
        }
      }
    );

    setPreviewData(res.data.preview);
    setPreviewTotal(res.data.total);
    setShowPreview(true);

  }

  catch (err) {

    alert(
      err.response?.data?.msg ||
      "Preview failed"
    );

  }

};
const restoreCase = async (id) => {

  try {

    const res = await axios.put(
      `http://localhost:5000/api/testcases/${id}/restore`,
      {},
      {
        headers: { "x-auth-token": token }
      }
    );

    alert(res.data.msg);
    fetchCases();

  } catch (err) {

    alert(
      err.response?.data?.msg ||
      "Restore failed"
    );

  }

};
const permanentDelete = async (id) => {

  if (!window.confirm("This action cannot be undone. Continue?")) {
    return;
  }

  try {

    const res = await axios.delete(
      `http://localhost:5000/api/testcases/${id}/permanent`,
      {
        headers: { "x-auth-token": token }
      }
    );

    alert(res.data.msg);
    fetchCases();

  } catch (err) {

    alert(
      err.response?.data?.msg ||
      "Permanent delete failed"
    );

  }

};
const uploadAttachment = async (id, file) => {

  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    await axios.post(
      `http://localhost:5000/api/testcases/${id}/upload`,
      formData,
      {
        headers: {
          "x-auth-token": token,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("File uploaded successfully");

    fetchCases(); // refresh list

  } catch (err) {
    alert("Upload failed");
    console.error(err);
  }
};

  // ================= UI =================
return (
  <div className="auth-container">
    <div className="auth-card test-card">

      <div className="page-header">
        <h2>Test Case Management</h2>
      </div>

      {editId && (
        <p style={{ color: "#d1e6ef" }}>
          Editing Mode: Update the test case
        </p>
      )}

      {/* ================= CREATE TAB ================= */}
          {/* ================= CREATE TAB ================= */}
{activeTab === "create" && (
  <form onSubmit={addCase}>

    <input
      placeholder="Title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      required
    />

    <input
  type="file"
  multiple
  onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
/>

      <input
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
        placeholder="Expected Result"
        value={expected}
        onChange={(e) => setExpected(e.target.value)}
        required
      />

      <input
        placeholder="Module"
        value={module}
        onChange={(e) => setModule(e.target.value)}
        required
      />

      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>

      <select value={severity} onChange={(e) => setSeverity(e.target.value)} required>
        <option value="">Select Severity</option>
        <option>Blocker</option>
        <option>Critical</option>
        <option>Major</option>
        <option>Minor</option>
        <option>Trivial</option>
      </select>

      <select value={type} onChange={(e) => setType(e.target.value)} required>
        <option value="">Select Type</option>
        <option>Functional</option>
        <option>Regression</option>
        <option>Smoke</option>
        <option>Integration</option>
        <option>Security</option>
        <option>Performance</option>
      </select>

      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>Pending</option>
        <option>Pass</option>
        <option>Fail</option>
      </select>

      <textarea
        placeholder="Preconditions"
        value={preconditions}
        onChange={(e) => setPreconditions(e.target.value)}
      />

      <textarea
        placeholder="Test Data"
        value={testData}
        onChange={(e) => setTestData(e.target.value)}
      />

      <textarea
        placeholder="Environment"
        value={environment}
        onChange={(e) => setEnvironment(e.target.value)}
      />

      <h4>Test Steps</h4>

      {stepsList.map((step, index) => (
        <div key={index} className="step-card">
          <p><b>Step {index + 1}</b></p>

          <input
            placeholder="Action"
            value={step.action}
            onChange={(e) => updateStep(index, "action", e.target.value)}
            required
          />

          <input
            placeholder="Test Data"
            value={step.testData}
            onChange={(e) => updateStep(index, "testData", e.target.value)}
          />

          <input
            placeholder="Expected Result"
            value={step.expected}
            onChange={(e) => updateStep(index, "expected", e.target.value)}
            required
          />

          {stepsList.length > 1 && (
            <button
              type="button"
              onClick={() => removeStep(index)}
              style={{ background: "#dc2626", marginTop: "5px" }}
            >
              Remove Step
            </button>
          )}
        </div>
      ))}

     <button type="button" onClick={addStep} className="primary-btn">
      + Add Step
    </button>

    <button type="submit" className="success-btn">
      {editId ? "Update Test Case" : "Add Test Case"}
    </button>

  </form>
)}

      {/* ================= VIEW TAB ================= */}
      {activeTab === "view" && (
        <>

          {(role === "tester" || role === "admin") && (
            <div className="test-header">
  <button onClick={selectAllCases}>Select All</button>
  <button onClick={bulkDelete}>Bulk Delete</button>
  <button onClick={() => bulkStatusUpdate("Approved")}>Mark Approved</button>
  <button onClick={() => bulkStatusUpdate("Draft")}>Mark Draft</button>
  <button onClick={bulkExport}>Export CSV</button>
</div>
          )}
        
       <div className="search-wrapper">
  <div className="search-box">
    <input
      type="text"
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    <span className="search-icon">
  <FiSearch />
</span>
  </div>
</div>

          <h3>My Test Cases</h3>

          {cases.active.length === 0 && <p>No test cases yet</p>}

          {cases.active.map((tc) => (

    <div key={tc.id} className="testcase-row-wrapper">

  <div className="row-checkbox">
    <input
      type="checkbox"
      checked={selectedCases.includes(tc.id)}
      onChange={() => toggleSelectCase(tc.id)}
    />
  </div>

  <div className="testcase-card">

      <div className="testcase-grid">

        <div className="field">
          <label>Test Case ID</label>
          <p>{tc.testCaseId}</p>
        </div>

        <div className="field">
          <label>Title</label>
          <p>{tc.title}</p>
        </div>

        <div className="field">
          <label>Description</label>
          <p>{tc.description}</p>
        </div>

        <div className="field">
          <label>Module</label>
          <p>{tc.module}</p>
        </div>

        <div className="field">
          <label>Expected Result</label>
          <p>{tc.expected}</p>
        </div>

        <div className="field">
          <label>Priority</label>
          <p>{tc.priority}</p>
        </div>

        <div className="field">
          <label>Severity</label>
          <p>{tc.severity}</p>
        </div>

        <div className="field">
          <label>Status</label>
          <p>{tc.status}</p>
        </div>

          
</div>       {/* testcase-row-wrapper */}
      <div className="card-bottom">
  <span className="created-by">
    Created by: {tc.user?.name} ({tc.user?.email})
  </span>

  <div className="card-actions">
    <button
      className="small-action-btn"
      onClick={() => fetchHistory(tc.id)}
    >
      View More...
    </button>

    <button
      className="small-action-btn execute-btn"
      onClick={() => navigate(`/execute/${tc.id}`)}
    >
      Execute
    </button>
  </div>
</div>
      </div>   {/* testcase-card */}

    </div>
    
))}

          {role === "admin" && (
            <>
              <h3 style={{ marginTop: "30px", color: "black" }}>
                Soft Deleted Test Cases
              </h3>

             {cases.deleted.length === 0 && (
  <p style={{ color: "#666" }}>
    No soft deleted test cases
  </p>
)}

{cases.deleted.map((tc) => (
  <div key={tc.id} className="testcase-row-wrapper">

     <div className="testcase-card">

      <div className="testcase-grid">

        <div className="field">
          <label>Test Case ID</label>
          <p>{tc.testCaseId}</p>
        </div>

        <div className="field">
          <label>Title</label>
          <p>{tc.title}</p>
        </div>

        <div className="field">
          <label>Priority</label>
          <p>{tc.priority}</p>
        </div>


        <div className="field">
          <label>Status</label>
          <p>{tc.status}</p>
        </div>

          
</div>       {/* testcase-row-wrapper */}
<div
  style={{
    display: "flex",
    alignItems: "center",
    marginTop: "15px",
  }}
>
  {/* Left side */}
 <span className="created-by">
          Created by: {tc.user?.name} ({tc.user?.email})
        </span>
  {/* Right side buttons */}
  <div
    style={{
      marginLeft: "auto",
      display: "flex",
      gap: "15px",
    }}
  >
    <button
      onClick={() => restoreCase(tc.id)}
      style={{
        width: "180px",
        padding: "12px 0",
        background: "black",
        color: "white",
        borderRadius: "6px",
        cursor: "pointer",
        border: "none"
      }}
    >
      Restore
    </button>

    <button
      onClick={() => permanentDelete(tc.id)}
      style={{
        width: "180px",
        padding: "12px 0",
        background: "black",
        color: "white",
        borderRadius: "6px",
        cursor: "pointer",
        border: "none"
      }}
    >
      Permanent Delete
    </button>
  </div>
</div>
    </div>
  </div>
))}
            </>
          )}
        </>
      )}

      {/* ================= IMPORT TAB ================= */}
      {activeTab === "import" && (
        <>
          {(role === "tester" || role === "admin") && (
            <div style={{ marginBottom: "15px" }}>
              <input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setImportFile(e.target.files[0])}
                style={{
      border: "1px solid black",
      padding: "6px",
      borderRadius: "6px",
      backgroundColor: "#fff"
    }}
              />

              <button
                type="button"
                onClick={previewImport}
                style={{
                  width: "100%",
  padding: "12px",
  background: "black",
  color: "white",
  border: "none",
  borderRadius: "6px",
  fontSize: "16px",
  cursor: "pointer",
  textAlign: "center"
                }}
              >
                Preview Import
              </button>
            </div>
          )}

          {showPreview && (
  <div
    style={{
      marginTop: "20px",
      padding: "15px",
      border: "1px solid #334155",
      borderRadius: "8px",
      background: "#f8fafc"
    }}
  >
    <h3>Preview ({previewTotal} rows found)</h3>

    {previewData.length === 0 ? (
      <p>No data found in file</p>
    ) : (
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px"
          }}
        >
          <thead>
            <tr>
              {Object.keys(previewData[0]).map((key) => (
                <th
                  key={key}
                  style={{
                    border: "1px solid #cbd5e1",
                    padding: "8px",
                    background: "#e2e8f0",
                    textAlign: "left"
                  }}
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {previewData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td
                    key={i}
                    style={{
                      border: "1px solid #cbd5e1",
                      padding: "8px"
                    }}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <div style={{ marginTop: "15px" }}>
      <button
        onClick={confirmImport}
        style={{
          background: "#16a34a",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px",
          marginRight: "10px"
        }}
      >
        Confirm Import
      </button>

      <button
        onClick={() => setShowPreview(false)}
        style={{
          background: "#dc2626",
          color: "white",
          padding: "8px 16px",
          border: "none",
          borderRadius: "6px"
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
        </>
      )}

      {/* ================= TEMPLATES TAB ================= */}
     {activeTab === "templates" && (
  <div className="templates-container">
        
          <h3>Templates</h3>

          {templates.length === 0 && (
            <p>No templates available</p>
          )}

         {templates.map(template => (
  <div key={template.id} className="template-card">
              <p>
                <b>{template.name}</b>
              </p>

              <p className="template-created">
                Created by: {template.createdBy?.name} ({template.createdBy?.email})
              </p>

              <button
                onClick={() => applyTemplate(template.id)}
                className="template-btn"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ================= HISTORY PANEL ================= */}
      {showHistoryId && selectedTestCase && (
  <div className="popup-overlay" onClick={() => setShowHistoryId(null)}>
    <div className="popup-card" onClick={(e) => e.stopPropagation()}>

      <h3>Test Case Details</h3>

      {/* ===== Test Steps ===== */}


<p><b>ID:</b> {selectedTestCase.testCaseId}</p>
<p><b>Title:</b> {selectedTestCase.title}</p>
<p><b>Description:</b> {selectedTestCase.description}</p>
<p><b>Module:</b> {selectedTestCase.module}</p>
<p><b>Expected:</b> {selectedTestCase.expected}</p>
<p><b>Priority:</b> {selectedTestCase.priority}</p>
<p><b>Severity:</b> {selectedTestCase.severity}</p>
<p><b>Status:</b> {selectedTestCase.status}</p>
<p><b>Preconditions:</b> {selectedTestCase.preconditions}</p>
<p><b>Test Data:</b> {selectedTestCase.testData}</p>
<p><b>Environment:</b> {selectedTestCase.environment}</p>

<h4>Test Steps</h4>
{selectedTestCase.steps?.map((step, index) => (
  <div key={index} className="popup-step">
    <p><b>Step {index + 1}</b></p>
    <p>Action: {step.action}</p>
    <p>Test Data: {step.testData}</p>
    <p>Expected: {step.expected}</p>
  </div>
))}

      {/* ===== Action Buttons (Backend Connected) ===== */}
      <div className="popup-actions-bar">

        <button onClick={() => editCase(selectedTestCase)}>
          Edit
        </button>

        <button onClick={() => saveTemplate(showHistoryId)}>
          Save Template
        </button>

        <button onClick={() => cloneCase(showHistoryId, true)}>
          Clone with Attach
        </button>

        <button onClick={() => cloneCase(showHistoryId, false)}>
          Clone
        </button>

        <button
  onClick={async () => {
    await fetchHistory(showHistoryId);
    setShowHistoryPopup(true);
  }}
>
  History
</button>

        <button onClick={() => deleteCase(showHistoryId)}>
          Delete
        </button>

        <button onClick={() => setShowHistoryId(null)}>
          Close
        </button>

      </div>

    </div>
  </div>
)}

{showHistoryPopup && (
  <div
    className="popup-overlay"
    onClick={() => setShowHistoryPopup(false)}
  >
    <div
      className="history-popup-card"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Version History</h3>

      {history.length === 0 && (
        <p>No history available</p>
      )}

      {history.map((h) => (
        <details key={h.id} className="history-dropdown">
          <summary>
            Version v{h.version} - {new Date(h.createdAt).toLocaleDateString()}
          </summary>

          <div className="history-content">
            <p><b>Summary:</b> {h.summary}</p>
            <p>
              <b>Edited By:</b> {h.editedBy.name} ({h.editedBy.email})
            </p>
            <p>
              <b>Date:</b> {new Date(h.createdAt).toLocaleString()}
            </p>
          </div>
        </details>
      ))}

      <button
        onClick={() => setShowHistoryPopup(false)}
        className="black-btn"
      >
        Close
      </button>

    </div>
  </div>
)}

    </div>
  </div>
);
}