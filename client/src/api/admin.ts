import api from "../utils/axios";

// ──────── Helpers ────────

const adminApi = () => {
  const token = localStorage.getItem("adminToken");
  return { headers: token ? { Authorization: `Bearer ${token}` } : {} };
};

// ──────── Auth ────────

export interface AdminLoginResponse {
  token: string;
  admin: { _id: string; name: string; email: string; role: string };
}

export const adminLogin = async (data: { email: string; password: string }): Promise<AdminLoginResponse> => {
  const res = await api.post("/admin/login", data);
  if (res.data.token) localStorage.setItem("adminToken", res.data.token);
  return res.data;
};

export const getAdminMe = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) return null;
    const res = await api.get("/admin/me", adminApi());
    return res.data;
  } catch {
    localStorage.removeItem("adminToken");
    return null;
  }
};

// ──────── Dashboard Stats ────────

export const getAdminStats = async () => {
  const res = await api.get("/admin/stats", adminApi());
  return res.data;
};

// ──────── Users ────────

export const getAdminUsers = async () => {
  const res = await api.get("/admin/users", adminApi());
  return res.data;
};

export const updateAdminUser = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/users/${id}`, data, adminApi());
  return res.data;
};

export const deleteAdminUser = async (id: string) => {
  const res = await api.delete(`/admin/users/${id}`, adminApi());
  return res.data;
};

// ──────── Theatres ────────

export const getAdminTheatres = async () => {
  const res = await api.get("/admin/theatres", adminApi());
  return res.data;
};

export const updateAdminTheatre = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/theatres/${id}`, data, adminApi());
  return res.data;
};

export const deleteAdminTheatre = async (id: string) => {
  const res = await api.delete(`/admin/theatres/${id}`, adminApi());
  return res.data;
};

export const getAdminTheatreScreens = async (id: string) => {
  const res = await api.get(`/admin/theatres/${id}/screens`, adminApi());
  return res.data;
};

// ──────── Bookings ────────

export const getAdminBookings = async () => {
  const res = await api.get("/admin/bookings", adminApi());
  return res.data;
};

export const updateAdminBookingStatus = async (id: string, status: string) => {
  const res = await api.put(`/admin/bookings/${id}/status`, { status }, adminApi());
  return res.data;
};

// ──────── Movies ────────

export const getAdminMovies = async () => {
  const res = await api.get("/admin/movies", adminApi());
  return res.data;
};

export const updateAdminMovie = async (id: string, data: Record<string, any>) => {
  const res = await api.put(`/admin/movies/${id}`, data, adminApi());
  return res.data;
};
