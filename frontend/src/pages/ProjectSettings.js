import React, { useEffect, useState } from "react";
import api from "../api";
import Swal from "sweetalert2";
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

  const confirm = await Swal.fire({
    title: "Delete Module?",
    text: "This module will be removed.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Delete",
  });

  if (!confirm.isConfirmed) return;

  await api.delete(`/projects/modules/${id}`);

  Swal.fire("Deleted!", "Module removed successfully.", "success");

  loadSettings();
};
const deleteEnv = async (id) => {

  const confirm = await Swal.fire({
    title: "Delete Environment?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete"
  });

  if (!confirm.isConfirmed) return;

  await api.delete(`/projects/environments/${id}`);

  Swal.fire("Deleted!", "Environment removed.", "success");

  loadSettings();
};
const deleteField = async (id) => {

  const confirm = await Swal.fire({
    title: "Delete Custom Field?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete"
  });

  if (!confirm.isConfirmed) return;

  await api.delete(`/projects/custom-fields/${id}`);

  Swal.fire("Deleted!", "Custom field removed.", "success");

  loadSettings();
};
const updateWorkflow = async (id, statuses) => {

  await api.put(`/projects/workflow/${id}`, {
    statuses
  });

  loadSettings();
};
  return (
    <div className="assigned-projects-wrapper">

  <div className="assigned-projects-box">
   
    <div className="container">

      {/* MODULES */}
      <div className="settings-box">
        <h3>Modules</h3>

<div className="settings-input-row">

<input
  type="text"
  placeholder="New Module"
  value={newModule}
  onChange={(e) => setNewModule(e.target.value)}
/>

<button className="settings-add-btn" onClick={addModule}>
Add Module
</button>

</div>

<div className="settings-list">
{modules.map(m => (

<div key={m.id} className="settings-item-card">

<span>{m.name}</span>

<button
className="delete-btn"
onClick={() => deleteModule(m.id)}
>
Delete
</button>

</div>

))}
</div>

      </div>

      {/* ENVIRONMENTS */}
      <div className="settings-box">
        <h3>Environments</h3>
  <div className="settings-input-row">

<input
  value={newEnv}
  onChange={(e)=>setNewEnv(e.target.value)}
  placeholder="New environment"
/>

<button className="settings-add-btn" onClick={addEnv}>Add Environment</button>
</div>
       <div className="settings-list">
{environments.map(e => (

<div key={e.id} className="settings-item-card">

<span>{e.name}</span>

<button
className="delete-btn"
onClick={() => deleteEnv(e.id)}
>
Delete
</button>

</div>

))}
</div>

      </div>

      {/* CUSTOM FIELDS */}
      <div className="settings-box">
        <h3>Custom Fields</h3>
  
<div className="settings-input-row">

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

<button className="settings-add-btn" onClick={addField}>Add Field</button>
</div>
        <div className="settings-list">
{fields.map(f => (

<div key={f.id} className="settings-item-card">

<span>{f.name} ({f.type})</span>

<button
className="delete-btn"
onClick={() => deleteField(f.id)}
>
Delete
</button>

</div>

))}
</div>

      </div>

      {/* WORKFLOW */}
      <div className="settings-box">
        <h3>Workflow</h3>
  <div className="settings-input-row">

<input
  placeholder="Draft, Review, Approved"
  value={statuses}
  onChange={(e)=>setStatuses(e.target.value)}
/>

<button className="settings-add-btn" onClick={saveWorkflow}>Save Workflow</button>

</div>
<div className="settings-list">
      {workflow.map(w => (
  <div key={w.id}  className="settings-item-card">

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

    <button className="delete-btn" onClick={() => updateWorkflow(w.id, w.statuses)}>
      Edit Workfolw
    </button>

  </div>
))}
</div>

      </div>

    </div>
</div>
</div>
  );
};

export default ProjectSettings;