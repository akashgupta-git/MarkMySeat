import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/axios";

const MyBookings: React.FC = () => {
  const { token } = useContext(AuthContext);  // ✅ Use token directly
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get("/bookings/my-bookings", {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Use token here
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBookings(); // ✅ Check token instead of user?.token
  }, [token]);

  if (loading) return <p className="p-4">Loading your bookings...</p>;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">🎟️ My Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li key={b._id} className="bg-white p-4 shadow rounded">
              <p><strong>Movie:</strong> {b.movie?.title}</p>
              <p><strong>Seat:</strong> {b.seatNumber}</p>
              <p><strong>Show Time:</strong> {b.showTime}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;
