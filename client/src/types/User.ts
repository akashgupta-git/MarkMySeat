export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role?: string;
  isAdmin?: boolean;
}

// what comes back from login/register endpoints
export interface AuthUser {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Theatre types
export interface Theatre {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  screens?: number;
  seatConfig?: SeatConfig;
  isApproved?: boolean;
  logoUrl?: string;
  createdAt?: string;
}

export interface SeatCategory {
  name: string;
  rows: string[];
  price: number;
  color: string;
}

export interface SeatConfig {
  rows: number;
  seatsPerRow: number;
  categories: SeatCategory[];
}

export interface AuthTheatre {
  token: string;
  theatre: {
    _id: string;
    name: string;
    email: string;
    city: string;
  };
}

// Screen types
export interface Screen {
  _id: string;
  theatre: string;
  name: string;
  screenNumber: number;
  seatConfig: SeatConfig;
  isActive: boolean;
  createdAt?: string;
}

// Food types
export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: "Popcorn" | "Beverage" | "Snack" | "Combo" | "Meal";
  imageUrl: string;
  isVeg: boolean;
  isAvailable: boolean;
  theatre: string | null;
}

export interface FoodOrderItem {
  item: string;
  name: string;
  quantity: number;
  price: number;
}
