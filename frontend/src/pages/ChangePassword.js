import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../auth.css";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

const handleSubmit = async (e) => {
  e.preventDefault();

  setMsg("");
  setError("");

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/change-password",
      { currentPassword, newPassword },
      {
        headers: {
          "x-auth-token": token,
        },
      }
    );

    setMsg(res.data.msg);
    setCurrentPassword("");
    setNewPassword("");

    // 🔥 Redirect after success
    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);

  } catch (err) {
    setError(err.response?.data?.msg || "Error");
  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Change Password</h2>

        {msg && <p className="success-msg">{msg}</p>}
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
            required
          />

          <button type="submit" className="login-btn">Update Password</button>
        </form>
      </div>
    </div>
  );
}