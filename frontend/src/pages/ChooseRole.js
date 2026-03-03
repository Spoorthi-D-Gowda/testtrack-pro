import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function ChooseRole() {

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const email = params.get("email");
  const name = params.get("name");
  const googleId = params.get("googleId");

  const [role, setRole] = useState("tester");

  const handleSubmit = async () => {
    const res = await axios.post(
      "http://localhost:5000/api/auth/google/register",
      { email, name, role, googleId }
    );

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);
    localStorage.setItem("role", role);

    navigate("/dashboard");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Select Your Role</h2>

        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="tester">Tester</option>
          <option value="developer">Developer</option>
        </select>

        <button onClick={handleSubmit}>
          Continue
        </button>
      </div>
    </div>
  );
}