import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../auth.css";
import Swal from "sweetalert2";
export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

const handleSubmit = async (e) => {
  e.preventDefault();

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

    Swal.fire({
      icon: "success",
      title: "Password Updated",
      text: res.data.msg,
      confirmButtonColor: "#3085d6",
    });

    setCurrentPassword("");
    setNewPassword("");

    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.msg || "Something went wrong",
    });

  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Change Password</h2>

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