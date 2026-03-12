import { useEffect, useState } from "react";
import api from "../api";

export default function NotificationSettingsModal({ onClose }) {

const [prefs,setPrefs] = useState(null);

const token =
localStorage.getItem("accessToken") ||
sessionStorage.getItem("accessToken");

useEffect(()=>{
fetchPrefs();
},[]);

const fetchPrefs = async () => {

const res = await api.get(
"http://localhost:5000/api/notification-preferences",
{
headers:{ "x-auth-token": token }
}
);

setPrefs(res.data);

};

const savePrefs = async () => {

await api.put(
"http://localhost:5000/api/notification-preferences",
prefs,
{
headers:{ "x-auth-token": token }
}
);

alert("Preferences updated");

onClose();

};

if(!prefs) return null;

return(

<div className="modal-overlay">

<div className="modal-box">

<h2>Notification Preferences</h2>

{/* BUG ASSIGNED */}
<div className="pref-row">

<span>Bug Assigned</span>

<label>
<input
type="checkbox"
checked={prefs.bugAssignedEmail}
onChange={(e)=>
setPrefs({
...prefs,
bugAssignedEmail:e.target.checked
})
}
/>
Email
</label>

<label>
<input
type="checkbox"
checked={prefs.bugAssignedInApp}
onChange={(e)=>
setPrefs({
...prefs,
bugAssignedInApp:e.target.checked
})
}
/>
In-App
</label>

</div>
<div className="pref-row">

<span>Bug Status Change</span>

<label>
<input
type="checkbox"
checked={prefs.bugStatusEmail}
onChange={(e)=>
setPrefs({
...prefs,
bugStatusEmail:e.target.checked
})
}
/>
Email
</label>

<label>
<input
type="checkbox"
checked={prefs.bugStatusInApp}
onChange={(e)=>
setPrefs({
...prefs,
bugStatusInApp:e.target.checked
})
}
/>
In-App
</label>

</div>
<div className="pref-row">

<span>Re-test Request</span>

<label>
<input
type="checkbox"
checked={prefs.retestEmail}
onChange={(e)=>
setPrefs({
...prefs,
retestEmail:e.target.checked
})
}
/>
Email
</label>

<label>
<input
type="checkbox"
checked={prefs.retestInApp}
onChange={(e)=>
setPrefs({
...prefs,
retestInApp:e.target.checked
})
}
/>
In-App
</label>

</div>
{/* TEST RUN */}

<div className="pref-row">

<span>Test Run Assigned</span>

<label>
<input
type="checkbox"
checked={prefs.testRunEmail}
onChange={(e)=>
setPrefs({
...prefs,
testRunEmail:e.target.checked
})
}
/>
Email
</label>

<label>
<input
type="checkbox"
checked={prefs.testRunInApp}
onChange={(e)=>
setPrefs({
...prefs,
testRunInApp:e.target.checked
})
}
/>
In-App
</label>

</div>

{/* QUIET HOURS */}

<h3>Quiet Hours</h3>

<div className="quiet-row">

<label>

Start

<input
type="time"
value={prefs.quietStart || ""}
onChange={(e)=>
setPrefs({
...prefs,
quietStart:e.target.value
})
}
/>

</label>

<label>

End

<input
type="time"
value={prefs.quietEnd || ""}
onChange={(e)=>
setPrefs({
...prefs,
quietEnd:e.target.value
})
}
/>

</label>

</div>

<div className="modal-actions">

<button
className="save-btn"
onClick={savePrefs}
>
Save
</button>

<button
className="cancel-btn"
onClick={onClose}
>
Cancel
</button>

</div>

</div>

</div>

);

}