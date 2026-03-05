import axios from "axios";

// base axios instance - all api calls go through this
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

// auto-attach jwt token if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
