import api from "../utils/axios";

/**
 * Fetches available seats from GET /api/bookings/available-seats
 */
export const getAvailableSeats = async (movieId: string, showTime: string): Promise<string[]> => {
  try {
    const response = await api.get("/bookings/available-seats", {
      params: { movieId, showTime },
    });
    return response.data.availableSeats || []; // Return just the array of seat strings
  } catch (error) {
    console.error("Error fetching available seats:", error);
    throw new Error("Could not fetch seats.");
  }
};

// ... any other BOOKING functions like 'createBooking' go here ...
/**
 * Creates a new booking for *multiple* seats.
 * Calls POST /api/bookings/create
 */
export const createBooking = async (
  movieId: string,
  seatNumbers: string[], // ✅ Send an array
  showTime: string
) => {
  try {
    const response = await api.post("/bookings/create", {
      movieId,
      seatNumbers, // ✅ Pass the array
      showTime,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error creating booking:", error.response?.data?.message || error.message);
    // Throw the specific backend error message
    throw new Error(error.response?.data?.message || "Error creating booking");
  }
};

// Simple interface for a booking
export interface Booking {
  _id: string;
  movie: {
    _id: string;
    title: string;
  };
  seatNumbers: string[];
  showTime: string;
  createdAt: string;
}

/**
 * Fetches all bookings for the logged-in user
 * Calls GET /api/bookings/my-bookings
 */
export const getMyBookings = async (): Promise<Booking[]> => {
  try {
    const response = await api.get("/bookings/my-bookings");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching 'my bookings':", error);
    throw error;
  }
};