// This is the basic User object
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin?: boolean; // Optional, if you add admin roles
}

// This is what the backend returns on login/register
export interface AuthUser {
  token: string;
  user: User;
}

// Type for the login form
export interface LoginData {
  email: string;
  password: string;
}

// Type for the register form
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}