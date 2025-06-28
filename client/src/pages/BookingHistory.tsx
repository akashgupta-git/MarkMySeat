import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

interface Booking {
  seatNumber: string;
  showTime: string;
  movieTitle: string;
  createdAt: string;
}

const BookingHistory: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const res = await axios.get("/api/bookings/my-bookings", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch booking history", err);
      }
    };

    fetchBookings();
  }, [user]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">🎟️ My Booking History</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b, idx) => (
            <li key={idx} className="border p-4 rounded shadow-sm bg-white">
              <p><strong>Movie:</strong> {b.movieTitle}</p>
              <p><strong>Seat:</strong> {b.seatNumber}</p>
              <p><strong>Show Time:</strong> {b.showTime}</p>
              <p><strong>Booked At:</strong> {new Date(b.createdAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookingHistory;
