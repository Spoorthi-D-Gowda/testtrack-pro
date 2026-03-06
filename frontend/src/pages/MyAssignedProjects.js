import { useEffect, useState } from "react";
import api from "../api";

export default function MyAssignedProjects({
  setActiveSection,
  setTestCaseTab
}) {

  const [projects, setProjects] = useState([]);

  useEffect(() => {

    const fetchProjects = async () => {

      const res = await api.get("/projects/my");

      setProjects(res.data);

    };

    fetchProjects();

  }, []);

  const selectProject = (id) => {

    localStorage.setItem("projectId", id);

    setActiveSection("testcases");

    setTestCaseTab("create");

  };

return (
  <div className="assigned-projects-wrapper">

  <div className="assigned-projects-box">

    <h2 className="assigned-title">My Assigned Projects</h2>

    <div className="projects-container">

      {projects.map(p => (

        <div key={p.id} className="project-card">

          <div className="project-info">

            <h3>{p.name}</h3>

            <p>{p.description || "No description"}</p>

          </div>

          <button
            className="add-test-btn"
            onClick={() => selectProject(p.id)}
          >
            Add Test Case
          </button>

        </div>

      ))}

    </div>

  </div>
  </div>
);

}