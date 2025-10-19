import axios from "axios";

// Use environment variable or fallback to localhost
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for handling 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove token on unauthorized
      localStorage.removeItem("token");
      // Optional: redirect to login if you integrate with router
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
