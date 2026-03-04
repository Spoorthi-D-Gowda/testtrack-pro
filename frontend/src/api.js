import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

/* =========================
REQUEST INTERCEPTOR
Adds auth token + project id
========================= */
api.interceptors.request.use((config) => {

  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  const projectId = localStorage.getItem("projectId");

  if (token) {
    config.headers["x-auth-token"] = token;
  }

  if (projectId) {
    config.headers["x-project-id"] = projectId;
  }

  return config;

});

/* =========================
RESPONSE INTERCEPTOR
Handles refresh token
========================= */
api.interceptors.response.use(
  (res) => res,
  async (error) => {

    if (error.response?.status === 401) {

      const refreshToken =
  localStorage.getItem("refreshToken") ||
  sessionStorage.getItem("refreshToken");

      try {

        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh-token",
          { refreshToken }
        );

        const newAccessToken = res.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        error.config.headers["x-auth-token"] = newAccessToken;

        return axios(error.config);

      } catch (err) {

        localStorage.clear();
        window.location.href = "/";

      }

    }

    return Promise.reject(error);
  }
);

export default api;