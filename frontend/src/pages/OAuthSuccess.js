import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

useEffect(() => {
  const params = new URLSearchParams(location.search);

  const accessToken = params.get("accessToken");
  const refreshToken = params.get("refreshToken");
  const role = params.get("role");
  const userId = params.get("userId");

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("role", role);
    localStorage.setItem("userId", userId);

    navigate("/dashboard");
  }
}, [location, navigate]);
  return <p>Logging you in...</p>;
}