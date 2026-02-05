import { useState } from "react";
import axios from "axios";
import "../auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMsg("");
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setMsg(res.data.msg);

    } catch (err) {
      setError(err.response?.data?.msg || "Error ");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Forgot Password</h2>

        {msg && <p className="success-msg">{msg}</p>}
        {error && <p className="error-msg">{error}</p>}

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
