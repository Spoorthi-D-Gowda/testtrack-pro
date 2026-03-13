import { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";
export default function MyAssignedProjects({
  setActiveSection,
  setTestCaseTab
}) {

  const [projects, setProjects] = useState([]);

useEffect(() => {

  const fetchProjects = async () => {

    try {

      const res = await api.get("/projects/my");

      setProjects(res.data);

      if (res.data.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Projects",
          text: "You are not assigned to any projects yet."
        });
      }

    } catch (err) {

      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Failed to Load",
        text: "Could not load assigned projects."
      });

    }

  };

  fetchProjects();

}, []);

const selectProject = (id) => {

  localStorage.setItem("projectId", id);

  Swal.fire({
    icon: "success",
    title: "Project Selected",
    text: "You can now create test cases for this project",
    timer: 1200,
    showConfirmButton: false
  });

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