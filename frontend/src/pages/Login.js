import { FaEye, FaEyeSlash } from "react-icons/fa";


import { useState, useEffect } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../auth.css";



export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [remember, setRemember] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (token) {
    navigate("/dashboard");
  }
}, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      if (remember) {
  localStorage.setItem("token", res.data.token);
} else {
  sessionStorage.setItem("token", res.data.token);
}


      setSuccess("Login successful! Redirecting... ");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (err) {
      if (err.response) {
        setError(err.response.data.msg || "Invalid credentials ");
      } else {
        setError("Server error ");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Login</h2>

        {success && <p className="success-msg">{success}</p>}
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div style={{ position: "relative" }}>
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />


  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: 10,
      top: 12,
      cursor: "pointer"
    }}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>
<div className="auth-options">

  <div className="remember-box">
    <input
      type="checkbox"
      checked={remember}
      onChange={() => setRemember(!remember)}
    />
    <span>Remember Me</span>
  </div>

  <a href="/forgot">Forgot Password?</a>

</div>


          <button type="submit">Login</button>

        </form>

        <div className="auth-link">
          New user? <a href="/register">Register</a>
        </div>

      </div>
    </div>
  );
}
