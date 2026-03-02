import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyEmail() {
  const { token } = useParams();
  const [msg, setMsg] = useState("Verifying...");

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/auth/verify/${token}`)
      .then(res => setMsg(res.data.msg))
      .catch(err =>
        setMsg(err.response?.data?.msg || "Verification failed")
      );
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{msg}</h2>
      </div>
    </div>
  );
}