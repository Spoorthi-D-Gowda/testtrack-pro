import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../auth.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      `http://localhost:5000/api/auth/reset-password/${token}`,
      { password }
    );

    Swal.fire({
      icon: "success",
      title: "Password Reset Successful",
      text: res.data.msg,
      timer: 2000,
      showConfirmButton: false
    });

    setTimeout(() => {
      navigate("/");
    }, 2000);

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Reset Failed",
      text: err.response?.data?.msg || "Something went wrong"
    });

  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Reset Password</h2>
        
        <form onSubmit={handleSubmit}>

          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Reset</button>

        </form>

      </div>
    </div>
  );
}
