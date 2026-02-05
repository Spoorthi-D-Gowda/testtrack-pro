import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import "../auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [role, setRole] = useState("tester");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const navigate = useNavigate();

  // Check password strength
  const checkPassword = (value) => {
    setPassword(value);

    if (value.length < 6) {
      setPasswordMsg("Use strong password (min 6 characters) ");
    } else {
      setPasswordMsg("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password too weak. Please use strong password ");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { name, email, password, role }
      );

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      if (err.response) {
        setError(err.response.data.msg || "Registration failed ");
      } else {
        setError("Server error ");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Register</h2>

        {success && <p className="success-msg">{success}</p>}
        {error && <p className="error-msg">{error}</p>}

        <form onSubmit={handleSubmit}>

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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
    onChange={(e) => checkPassword(e.target.value)}
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


          {passwordMsg && (
            <p className="password-msg">{passwordMsg}</p>
          )}

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="tester">Tester</option>
            <option value="developer">Developer</option>
          </select>

          <button type="submit">Register</button>

        </form>

        <div className="auth-link">
          Already have account? <a href="/">Login</a>
        </div>

      </div>
    </div>
  );
}
