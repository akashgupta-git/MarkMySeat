import api from "../utils/axios";

// fetch available seats for a given movie+showtime combo
export const getAvailableSeats = async (movieId: string, showTime: string): Promise<string[]> => {
  try {
    const response = await api.get("/bookings/available-seats", {
      params: { movieId, showTime },
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
  showTime: string
) => {
  try {
    const response = await api.post("/bookings/create", {
      movieId,
      seatNumbers,
      showTime,
    });
    return response.data;
  } catch (error: any) {
    console.error("Booking failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || "Error creating booking");
  }
};

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