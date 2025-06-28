import axios from "axios";

// Create a base Axios instance
const api = axios.create({
  baseURL: "http://localhost:8080/api", // or your backend URL
});

// Automatically attach token from localStorage (or any secure storage you're using)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
