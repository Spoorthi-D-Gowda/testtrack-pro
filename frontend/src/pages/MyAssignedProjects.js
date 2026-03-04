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

    <div className="auth-container">

      <div className="auth-card">

        <h2>My Assigned Projects</h2>

        {projects.map(p => (

          <div
            key={p.id}
            style={{
              background:"#eaf6ff",
              padding:"20px",
              borderRadius:"10px",
              marginBottom:"15px"
            }}
          >

            <h3>{p.name}</h3>

           <p style={{fontSize:"12px",color:"#666"}}>
  {p.description}
</p>

            <button
              style={{
                background:"#2563eb",
                color:"#fff",
                padding:"8px 14px",
                border:"none",
                borderRadius:"6px",
                cursor:"pointer"
              }}
              onClick={() => selectProject(p.id)}
            >
              Add Test Case
            </button>

          </div>

        ))}

      </div>

    </div>

  );

}