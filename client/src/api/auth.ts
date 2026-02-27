import api from "../utils/axios";
import { AuthUser, LoginData, RegisterData, User } from "../types/User";

// register + save token to localStorage
export const registerUser = async (userData: RegisterData): Promise<AuthUser> => {
  try {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error: any) {
    console.error("Register failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Error registering user");
  }
};

// login + save token
export const loginUser = async (userData: LoginData): Promise<AuthUser> => {
  try {
    const response = await api.post("/auth/login", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error: any) {
    console.error("Login failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Error logging in");
  }
};

// check if user is still logged in (called on app load)
export const verifyToken = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    localStorage.removeItem("token");
    return null;
  }
};

// update user profile
export const updateProfile = async (data: { name?: string; phone?: string; avatarUrl?: string }): Promise<User> => {
  const response = await api.put("/auth/profile", data);
  return response.data;
};

// change password
export const changePassword = async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
  const response = await api.put("/auth/change-password", data);
  return response.data;
};