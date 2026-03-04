import React, { useEffect, useState } from "react";
import api from "../api";

const ProjectSettings = () => {

  const projectId = localStorage.getItem("projectId");

  const [modules, setModules] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [fields, setFields] = useState([]);
  const [workflow, setWorkflow] = useState([]);

  const [newModule, setNewModule] = useState("");
  const [newEnv, setNewEnv] = useState("");
  const [fieldName, setFieldName] = useState("");
const [fieldType, setFieldType] = useState("text");
const [statuses, setStatuses] = useState("");

useEffect(() => {
  loadSettings();
}, [projectId]);

  const loadSettings = async () => {

    const mod = await api.get(`/projects/modules/${projectId}`);
    const env = await api.get(`/projects/environments/${projectId}`);
    const fld = await api.get(`/projects/custom-fields/${projectId}`);
    const wf = await api.get(`/projects/workflow/${projectId}`);

    setModules(mod.data);
    setEnvironments(env.data);
    setFields(fld.data);
    setWorkflow(wf.data);

  };
  const addModule = async () => {

  if (!newModule) return;

  await api.post(`/projects/modules/${projectId}`, {
    name: newModule
  });

  setNewModule("");
  loadSettings();
};
const addEnv = async () => {

  if (!newEnv) return;

  await api.post(`/projects/environments/${projectId}`, {
    name: newEnv
  });

  setNewEnv("");
  loadSettings();
};
const addField = async () => {

  await api.post(`/projects/custom-fields/${projectId}`, {
    name: fieldName,
    type: fieldType,
    options: []
  });

  setFieldName("");
  loadSettings();
};
const saveWorkflow = async () => {

  const list = statuses.split(",").map(s => s.trim());

  await api.post(`/projects/workflow/${projectId}`, {
    entity: "testcase",
    statuses: list
  });

  loadSettings();
};
const deleteModule = async (id) => {
  await api.delete(`/projects/modules/${id}`);
  loadSettings();
};
const deleteEnv = async (id) => {
  await api.delete(`/projects/environments/${id}`);
  loadSettings();
};
const deleteField = async (id) => {

  await api.delete(`/projects/custom-fields/${id}`);

  loadSettings();
};
const updateWorkflow = async (id, statuses) => {

  await api.put(`/projects/workflow/${id}`, {
    statuses
  });

  loadSettings();
};
  return (
  <div className="auth-container">
   
    <div className="container">

      <h2>Project Settings</h2>

      {/* MODULES */}
      <div className="settings-box">
        <h3>Modules</h3>

<input
        type="text"
        placeholder="New Module"
        value={newModule}
        onChange={(e) => setNewModule(e.target.value)}
      />

      <button onClick={addModule}>Add Module</button>

       {modules.map(m => (
  <div key={m.id}>
    {m.name}

    <button
      onClick={() => deleteModule(m.id)}
    >
      Delete
    </button>
  </div>
))}

      </div>

      {/* ENVIRONMENTS */}
      <div className="settings-box">
        <h3>Environments</h3>

<input
  value={newEnv}
  onChange={(e)=>setNewEnv(e.target.value)}
  placeholder="New environment"
/>

<button onClick={addEnv}>Add</button>

        {environments.map(e => (
          <div key={e.id}>{e.name}
          <button onClick={() => deleteEnv(e.id)}>
      Delete
    </button>
  </div>
        ))}

      </div>

      {/* CUSTOM FIELDS */}
      <div className="settings-box">
        <h3>Custom Fields</h3>

<input
  placeholder="Field name"
  value={fieldName}
  onChange={(e)=>setFieldName(e.target.value)}
/>

<select
  value={fieldType}
  onChange={(e)=>setFieldType(e.target.value)}
>
  <option value="text">Text</option>
  <option value="number">Number</option>
  <option value="dropdown">Dropdown</option>
</select>

<button onClick={addField}>Add Field</button>

        {fields.map(f => (
          <div key={f.id}>
            {f.name} ({f.type})
            <button onClick={() => deleteField(f.id)}>
      Delete
    </button>
  
          </div>
        ))}

      </div>

      {/* WORKFLOW */}
      <div className="settings-box">
        <h3>Workflow</h3>

<input
  placeholder="Draft, Review, Approved"
  value={statuses}
  onChange={(e)=>setStatuses(e.target.value)}
/>

<button onClick={saveWorkflow}>Save Workflow</button>

      {workflow.map(w => (
  <div key={w.id} className="settings-item">

    <input
      value={w.statuses.join(", ")}
      onChange={(e) =>
        setWorkflow(
          workflow.map(wf =>
            wf.id === w.id
              ? { ...wf, statuses: e.target.value.split(",").map(s => s.trim()) }
              : wf
          )
        )
      }
    />

    <button onClick={() => updateWorkflow(w.id, w.statuses)}>
      Edit
    </button>

  </div>
))}

      </div>

    </div>

  </div>
  );
};

export default ProjectSettings;