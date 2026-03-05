import api from "../utils/axios";
import { Theatre, AuthTheatre, FoodItem, Screen, SeatConfig } from "../types/User";

// ──────── Auth ────────

const theatreApi = () => {
  const token = localStorage.getItem("theatreToken");
  return {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
};

export const registerTheatre = async (data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
}): Promise<AuthTheatre> => {
  const response = await api.post("/theatre/auth/register", data);
  if (response.data.token) {
    localStorage.setItem("theatreToken", response.data.token);
  }
  return response.data;
};

export const loginTheatre = async (data: { email: string; password: string }): Promise<AuthTheatre> => {
  const response = await api.post("/theatre/auth/login", data);
  if (response.data.token) {
    localStorage.setItem("theatreToken", response.data.token);
  }
  return response.data;
};

export const getTheatreMe = async (): Promise<Theatre | null> => {
  try {
    const token = localStorage.getItem("theatreToken");
    if (!token) return null;
    const response = await api.get("/theatre/auth/me", theatreApi());
    return response.data;
  } catch {
    localStorage.removeItem("theatreToken");
    return null;
  }
};

// ──────── Profile ────────

export const updateTheatreProfile = async (data: Partial<Theatre>): Promise<Theatre> => {
  const response = await api.put("/theatre/auth/profile", data, theatreApi());
  return response.data;
};

export const updateSeatConfig = async (data: {
  rows?: number;
  seatsPerRow?: number;
  categories?: { name: string; rows: string[]; price: number; color: string }[];
}): Promise<Theatre> => {
  const response = await api.put("/theatre/auth/seat-config", data, theatreApi());
  return response.data;
};

// ──────── Screens ────────

export const getTheatreScreens = async (): Promise<Screen[]> => {
  const response = await api.get("/theatre/screens", theatreApi());
  return response.data;
};

export const addScreen = async (data: {
  name: string;
  screenNumber: number;
  seatConfig?: SeatConfig;
}): Promise<{ screen: Screen }> => {
  const response = await api.post("/theatre/screens", data, theatreApi());
  return response.data;
};

export const updateScreen = async (id: string, data: Partial<Screen>): Promise<{ screen: Screen }> => {
  const response = await api.put(`/theatre/screens/${id}`, data, theatreApi());
  return response.data;
};

export const deleteScreen = async (id: string): Promise<void> => {
  await api.delete(`/theatre/screens/${id}`, theatreApi());
};

// ──────── Movies ────────

export interface TheatreMovie {
  _id: string;
  title: string;
  posterUrl?: string;
  description?: string;
  genre?: string;
  language?: string;
  duration?: string;
  releaseDate?: string;
  showTimes: string[];
  rating?: string;
  cast?: string;
  isActive?: boolean;
  screen?: { _id: string; name: string; screenNumber: number } | string | null;
  createdAt?: string;
}

export const getTheatreMovies = async (): Promise<TheatreMovie[]> => {
  const response = await api.get("/theatre/movies", theatreApi());
  return response.data;
};

export const addTheatreMovie = async (data: Partial<TheatreMovie>): Promise<{ movie: TheatreMovie }> => {
  const response = await api.post("/theatre/movies", data, theatreApi());
  return response.data;
};

export const updateTheatreMovie = async (id: string, data: Partial<TheatreMovie>): Promise<{ movie: TheatreMovie }> => {
  const response = await api.put(`/theatre/movies/${id}`, data, theatreApi());
  return response.data;
};

export const deleteTheatreMovie = async (id: string): Promise<void> => {
  await api.delete(`/theatre/movies/${id}`, theatreApi());
};

// ──────── Bookings ────────

export interface TheatreBooking {
  _id: string;
  bookingId: string;
  user: { _id: string; name: string; email: string; phone?: string };
  movie: { _id: string; title: string; posterUrl?: string };
  seatNumbers: string[];
  showTime: string;
  totalPrice: number;
  foodTotal: number;
  status: string;
  createdAt: string;
}

export const getTheatreBookings = async (): Promise<TheatreBooking[]> => {
  const response = await api.get("/theatre/bookings", theatreApi());
  return response.data;
};

export const updateBookingStatus = async (id: string, status: string): Promise<void> => {
  await api.put(`/theatre/bookings/${id}/status`, { status }, theatreApi());
};

// ──────── Stats ────────

export interface TheatreStats {
  totalMovies: number;
  totalBookings: number;
  totalRevenue: number;
  totalFoodRevenue: number;
  recentBookings: TheatreBooking[];
}

export const getTheatreStats = async (): Promise<TheatreStats> => {
  const response = await api.get("/theatre/stats", theatreApi());
  return response.data;
};

// ──────── Food ────────

export const getTheatreFoodItems = async (): Promise<FoodItem[]> => {
  const response = await api.get("/food/my", theatreApi());
  return response.data;
};

export const addFoodItem = async (data: Partial<FoodItem>): Promise<{ item: FoodItem }> => {
  const response = await api.post("/food", data, theatreApi());
  return response.data;
};

export const updateFoodItem = async (id: string, data: Partial<FoodItem>): Promise<{ item: FoodItem }> => {
  const response = await api.put(`/food/${id}`, data, theatreApi());
  return response.data;
};

export const deleteFoodItem = async (id: string): Promise<void> => {
  await api.delete(`/food/${id}`, theatreApi());
};

// ──────── Public food menu ────────

export const getFoodMenu = async (theatreId?: string): Promise<FoodItem[]> => {
  const params = theatreId ? { theatre: theatreId } : {};
  const response = await api.get("/food", { params });
  return response.data;
};