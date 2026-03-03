import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

api.interceptors.response.use(
  res => res,
  async error => {
    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");

      const res = await axios.post(
        "http://localhost:5000/api/auth/refresh-token",
        { refreshToken }
      );

      localStorage.setItem("accessToken", res.data.accessToken);

      error.config.headers["x-auth-token"] = res.data.accessToken;

      return axios(error.config);
    }

    return Promise.reject(error);
  }
);

export default api;