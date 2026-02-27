import api from "../utils/axios";
import { FoodOrderItem } from "../types/User";

// fetch available seats for a given movie+showtime+date combo
export const getAvailableSeats = async (
  movieId: string,
  showTime: string,
  showDate?: string,
): Promise<string[]> => {
  try {
    const response = await api.get("/bookings/available-seats", {
      params: { movieId, showTime, showDate },
    });
    return response.data.availableSeats || [];
  } catch (error) {
    console.error("Error fetching available seats:", error);
    throw new Error("Could not fetch seats.");
  }
};

// book multiple seats at once
export const createBooking = async (
  movieId: string,
  seatNumbers: string[],
  showTime: string,
  totalPrice?: number,
  paymentId?: string,
  foodOrders?: FoodOrderItem[],
  foodTotal?: number,
  showDate?: string,
) => {
  try {
    const response = await api.post("/bookings/create", {
      movieId,
      seatNumbers,
      showTime,
      showDate,
      totalPrice,
      paymentId,
      foodOrders,
      foodTotal,
    });
    return response.data;
  } catch (error: any) {
    console.error("Booking failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Error creating booking");
  }
};

export interface Booking {
  _id: string;
  bookingId: string;
  movie: {
    _id: string;
    title: string;
    posterUrl?: string;
    genre?: string;
    language?: string;
    duration?: string;
  };
  seatNumbers: string[];
  showTime: string;
  showDate?: string;
  screenName?: string;
  totalPrice: number;
  paymentId: string;
  paymentMethod: string;
  foodOrders?: FoodOrderItem[];
  foodTotal?: number;
  status?: string;
  createdAt: string;
}

// get all bookings for current user
export const getMyBookings = async (): Promise<Booking[]> => {
  try {
    const response = await api.get("/bookings/my-bookings");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

// get a single booking by id
export const getBookingById = async (id: string): Promise<Booking> => {
  const response = await api.get(`/bookings/my-bookings/${id}`);
  return response.data;
};

// cancel a booking
export const cancelBooking = async (id: string): Promise<Booking> => {
  const response = await api.put(`/bookings/my-bookings/${id}/cancel`);
  return response.data.booking;
};

// public - verify a booking by bookingId (for QR scan)
export interface VerifiedBooking {
  valid: boolean;
  bookingId: string;
  status: string;
  movie: string;
  posterUrl: string;
  genre: string;
  language: string;
  duration: string;
  showTime: string;
  showDate?: string;
  screenName?: string;
  seats: string[];
  ticketCount: number;
  customerName: string;
  totalPrice: number;
  foodTotal: number;
  bookedAt: string;
}

export const verifyBooking = async (bookingId: string): Promise<VerifiedBooking> => {
  const response = await api.get(`/bookings/verify/${bookingId}`);
  return response.data;
};