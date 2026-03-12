import { useEffect, useState } from "react";
import api from "../api";

export default function NotificationBell() {

  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const fetchNotifications = async () => {
    try {

      const res = await api.get(
        "http://localhost:5000/api/notifications",
        {
          headers: { "x-auth-token": token }
        }
      );

      setNotifications(res.data);

      const unreadCount = res.data.filter(n => !n.isRead).length;

      setUnread(unreadCount);

    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

const markRead = async (id) => {

  try {

    await api.put(
      `http://localhost:5000/api/notifications/${id}/read`,
      {},
      { headers: { "x-auth-token": token } }
    );

    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );

    setUnread(prev => Math.max(prev - 1, 0));

  } catch (err) {
    console.error("Mark read error:", err);
  }

};

const deleteNotification = async (id) => {

  try {

    await api.delete(
      `http://localhost:5000/api/notifications/${id}`,
      { headers: { "x-auth-token": token } }
    );

    setNotifications(prev =>
      prev.filter(n => n.id !== id)
    );

  } catch (err) {
    console.error("Delete notification error:", err);
  }

};

const deleteAllNotifications = async () => {

  try {

    await api.delete(
      "http://localhost:5000/api/notifications",
      { headers: { "x-auth-token": token } }
    );

    setNotifications([]);
    setUnread(0);

  } catch (err) {

    console.error("Delete all notifications error:", err);

  }

};

  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);

  }, []);

  return (
    <div style={{ position: "relative" }}>

      {/* Bell Icon */}
      <div
        style={{
          fontSize: "20px",
          cursor: "pointer",
          position: "relative"
        }}
        onClick={() => setOpen(!open)}
      >
        <svg
  xmlns="http://www.w3.org/2000/svg"
  width="40"
  height="33"
  fill="#090909"
  viewBox="0 0 24 24"
>
  <path d="M12 2a6 6 0 0 0-6 6v3.586L4.707 13.88A1 1 0 0 0 5.414 15h13.172a1 1 0 0 0 .707-1.707L18 11.586V8a6 6 0 0 0-6-6zm1 19a2 2 0 1 1-4 0"/>
</svg>

        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-8px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: "12px"
            }}
          >
            {unread}
          </span>
        )}
      </div>

      {/* Dropdown */}
{open && (
  <div
    style={{
      position: "absolute",
      right: 0,
      top: "30px",
      width: "320px",
      background: "white",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
      maxHeight: "350px",
      overflowY: "auto",
      zIndex: 1000
    }}
  >

{/* HEADER */}
<div
style={{
display:"flex",
alignItems:"center",
justifyContent:"space-between",
padding:"10px 12px",
borderBottom:"1px solid #eee",
fontWeight:"600"
}}
>

<span
style={{cursor:"pointer"}}
onClick={()=>setOpen(false)}
>
←
</span>

<span>Notifications</span>

<svg
xmlns="http://www.w3.org/2000/svg"
width="18"
height="18"
fill="#444"
viewBox="0 0 24 24"
style={{cursor:"pointer"}}
onClick={deleteAllNotifications}
>
<path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z"/>
</svg>

</div>

          {notifications.length === 0 && (
            <div style={{ padding: "15px" }}>
              No notifications
            </div>
          )}

{notifications.map(n => (

<div
key={n.id}
style={{
padding:"10px",
borderBottom:"1px solid #eee",
background:n.isRead ? "white" : "#f0f8ff",
position:"relative"
}}
>

{/* CROSS DELETE */}
<span
onClick={(e)=>{
e.stopPropagation();
deleteNotification(n.id);
}}
style={{
position:"absolute",
top:"8px",
right:"10px",
cursor:"pointer",
fontWeight:"bold",
color:"#888"
}}
>
✕
</span>

<div
onClick={()=>markRead(n.id)}
style={{cursor:"pointer"}}
>

<div style={{fontWeight:"bold"}}>
{n.title}
</div>

<div style={{fontSize:"13px"}}>
{n.message}
</div>

<div style={{fontSize:"11px",color:"gray"}}>
{new Date(n.createdAt).toLocaleString()}
</div>

</div>

</div>

))}

        </div>
      )}

    </div>
  );
}