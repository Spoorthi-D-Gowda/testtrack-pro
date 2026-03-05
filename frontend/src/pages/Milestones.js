import { useState, useEffect } from "react";
import api from "../api";

export default function Milestones() {

const [milestones, setMilestones] = useState([]);
const [progress, setProgress] = useState({});

const [name, setName] = useState("");
const [date, setDate] = useState("");
const [rate, setRate] = useState("");


/* LOAD MILESTONES */

const load = async () => {
 try{
  const res = await api.get("/milestones");
  setMilestones(res.data);
 }catch(err){
  console.error("Milestones load error:",err);
  alert("Failed to load milestones");
 }
};


useEffect(() => {
 load();
}, []);


/* CREATE MILESTONE */

const create = async (e) => {

 e.preventDefault();

 await api.post("/milestones", {
  name,
  targetDate: date,
  targetPassRate: rate
 });

 setName("");
 setDate("");
 setRate("");

 load();
};


/* DELETE */

const deleteMilestone = async (id) => {

 await api.delete(`/milestones/${id}`);
 load();

};


return (

<div className="auth-container">
<div className="auth-card">

<h2>Project Milestones</h2>


{/* CREATE FORM */}

<form onSubmit={create} className="milestone-form">

<input
 placeholder="Milestone Name"
 value={name}
 onChange={(e)=>setName(e.target.value)}
 required
/>

<input
 type="date"
 value={date}
 onChange={(e)=>setDate(e.target.value)}
 required
/>

<input
 type="number"
 placeholder="Target Pass Rate %"
 value={rate}
 onChange={(e)=>setRate(e.target.value)}
 required
/>

<button className="success-btn">
Create Milestone
</button>

</form>


<h3>Milestones</h3>


{milestones.map(m => {

 const p = progress[m.id] || { passRate: 0 };

 return (

<div key={m.id} className="testcase-card">

<div className="testcase-grid">

<div className="field">
<label>Name</label>
<p>{m.name}</p>
</div>

<div className="field">
<label>Target Date</label>
<p>{new Date(m.targetDate).toLocaleDateString()}</p>
</div>

<div className="field">
<label>Target Pass Rate</label>
<p>{m.targetPassRate}%</p>
</div>

<div className="field">
<label>Linked Runs</label>
<p>{m.runs.length}</p>
</div>

<div className="field">
<label>Progress</label>
<p>{p.passRate}% Pass</p>
</div>


{/* PROGRESS BAR */}

<div className="progress-bar">
<div
 className="progress-fill"
 style={{width:`${p.passRate}%`}}
/>
</div>


<button
 onClick={()=>deleteMilestone(m.id)}
 className="danger-btn"
>
Delete
</button>

</div>

</div>

);

})}

</div>
</div>

);

}