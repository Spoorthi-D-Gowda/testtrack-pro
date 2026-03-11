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

      const unreadCount = res.data.filter(n => !n.read).length;

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
        {
          headers: { "x-auth-token": token }
        }
      );

      fetchNotifications();

    } catch (err) {
      console.error("Mark read error:", err);
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
        🔔

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
            width: "300px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
            maxHeight: "350px",
            overflowY: "auto",
            zIndex: 1000
          }}
        >

          {notifications.length === 0 && (
            <div style={{ padding: "15px" }}>
              No notifications
            </div>
          )}

          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                padding: "10px",
                borderBottom: "1px solid #eee",
                background: n.read ? "white" : "#f0f8ff",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: "bold" }}>
                {n.title}
              </div>

              <div style={{ fontSize: "13px" }}>
                {n.message}
              </div>

              <div style={{ fontSize: "11px", color: "gray" }}>
                {new Date(n.createdAt).toLocaleString()}
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}