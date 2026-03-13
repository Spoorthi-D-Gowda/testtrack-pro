import { useState } from "react";
import axios from "axios";
import "../auth.css";
import Swal from "sweetalert2";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/forgot-password",
      { email }
    );

    Swal.fire({
      icon: "success",
      title: "Email Sent",
      text: res.data.msg || "Password reset link sent to your email",
    });

    setEmail("");

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.response?.data?.msg || "Failed to send reset link",
    });

  }
};

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Forgot Password</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Send Reset Link</button>

        </form>

      </div>
    </div>
  );
}
