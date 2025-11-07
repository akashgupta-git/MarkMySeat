import api from "../utils/axios";
import { AuthUser, LoginData, RegisterData, User } from "../types/User";

/**
 * Register a new user
 */
export const registerUser = async (userData: RegisterData): Promise<AuthUser> => {
  try {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error: any) {
    console.error("Error registering user:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Error registering user");
  }
};

/**
 * Login a user
 */
export const loginUser = async (userData: LoginData): Promise<AuthUser> => {
  try {
    const response = await api.post("/auth/login", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error: any) {
    console.error("Error logging in:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Error logging in");
  }
};

/**
 * Verify token on app load (You may need a backend route for this)
 */
export const verifyToken = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    // Assumes you have a '/auth/me' or '/auth/verify' route
    const response = await api.get("/auth/me"); 
    return response.data; // Should return user data
  } catch (error) {
    localStorage.removeItem("token");
    return null;
  }
};