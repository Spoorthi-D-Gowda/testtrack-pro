import { useState, useEffect } from "react";
import api from "../api";
import Swal from "sweetalert2";
export default function CreateProject() {

  const [name, setName] = useState("");
  const [projects, setProjects] = useState([]);
 const [description, setDescription] = useState("");
const [testers, setTesters] = useState([]);
const [selectedTesters, setSelectedTesters] = useState([]);
const [selectedProjectId, setSelectedProjectId] = useState(null);
const [assignProjectId, setAssignProjectId] = useState(null);
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const fetchProjects = async () => {
    try {
      const res = await api.get(
        "http://localhost:5000/api/projects",
        {
          headers: { "x-auth-token": token }
        }
      );

      setProjects(res.data);

    } catch (err) {
      console.error(err);
    }
  };
  const fetchTesters = async () => {

  const res = await api.get("/auth/users");

  const testerUsers = res.data.filter(
    u => u.role === "tester"
  );

  setTesters(testerUsers);
};
const openAssignTesters = async (projectId) => {

  setAssignProjectId(projectId);

  const res = await api.get("/dashboard/stats");

  const testerUsers = res.data.testers;

  setTesters(testerUsers);

};

const assignTesters = async () => {

  const confirm = await Swal.fire({
    title: "Assign Testers?",
    text: "Are you sure you want to assign selected testers to this project?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Assign",
    cancelButtonText: "Cancel"
  });

  if (!confirm.isConfirmed) return;

  await api.post(
    `/projects/${assignProjectId}/assign-testers`,
    {
      testerIds: selectedTesters
    }
  );

  Swal.fire({
    icon: "success",
    title: "Success",
    text: "Testers assigned successfully",
  });

  setAssignProjectId(null);
  setSelectedTesters([]);
};

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async () => {
    if (!name.trim()) {
      Swal.fire({
  icon: "warning",
  title: "Missing Field",
  text: "Project name is required",
});
      return;
    }

    try {

   await api.post("/projects", {
      name,
      description
    });

      Swal.fire({
  icon: "success",
  title: "Project Created",
  text: "Project created successfully",
});

      setName("");

      fetchProjects();

    } catch (err) {
      console.error(err);
      Swal.fire({
  icon: "error",
  title: "Error",
  text: "Failed to create project",
});
    }
  };

  return (
    <div className="auth-container">
    <div className="auth-card test-card">
    <div style={{ padding: "30px" }}>

      <h2>Create Project</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            marginRight: "10px"
          }}
        />
        <textarea
  placeholder="Project Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>

        <button
          onClick={createProject}
          style={{
            padding: "10px 20px",
            background: "#0d2558",
            color: "white",
            border: "none",
            borderRadius: "6px"
          }}
        >
          Create
        </button>
      </div>

      <h3>Existing Projects</h3>

{projects.map((p) => (
  <div
    key={p.id} className="project-card">
<div className="project-info">
     <h3>{p.name}</h3>
    <p>{p.description}</p>

{p.testers?.length > 0 && (
  <div style={{marginTop:"5px"}}>
    {p.testers.map(t => (
      <div key={t.tester.id} style={{fontSize:"12px"}}>
        <strong>Assigned Testers:</strong>{t.tester.email}
      </div>
    ))}
  </div>
)}
</div>

   <button
  className="add-test-btn"
  onClick={() => openAssignTesters(p.id)}
>
  Assign Testers
</button>

    {assignProjectId === p.id && (
      <div
        style={{
          marginTop: "10px",
          background: "#f4f9ff",
          padding: "10px",
          borderRadius: "6px"
        }}
      >
        <h4>Select Testers</h4>

        {testers.map((t) => (
          <div key={t.id}>
            <label>
              <input
                type="checkbox"
                value={t.id}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTesters((prev) => [...prev, t.id]);
                  } else {
                    setSelectedTesters((prev) =>
                      prev.filter((id) => id !== t.id)
                    );
                  }
                }}
              />
              {t.name}
            </label>
          </div>
        ))}

        <button
          style={{
            marginTop: "10px",
            background: "green",
            color: "#fff",
            padding: "6px 12px",
            border: "none"
          }}
          onClick={assignTesters}
        >
          Assign Testers
        </button>
      </div>
    )}
  </div>
))}

    </div>
    </div>
    </div>
  );
}