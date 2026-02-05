import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../auth.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMsg("");
    setError("");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );

      setMsg(res.data.msg);

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.msg || "Error ");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Reset Password</h2>

        {msg && <p className="success-msg">{msg}</p>}
        {error && <p className="error-msg">{error}</p>}

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
