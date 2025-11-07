import React, { useEffect, useState } from "react";
import { getMyBookings, Booking } from "../api/bookings";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// A component for a single booking card
const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-5">
        <h2 className="text-xl font-bold text-indigo-600">
          {booking.movie.title}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Booked on: {new Date(booking.createdAt).toLocaleDateString()}
        </p>

        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500">Show Time</span>
            <p className="font-semibold text-gray-800">{booking.showTime}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">Seats</span>
            <p className="font-semibold text-gray-800">
              {booking.seatNumbers.join(", ")}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// The main page component
const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getMyBookings();
        // Sort bookings, newest first
        setBookings(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        setError("Failed to fetch your bookings.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-red-600">{error}</p>;
    }

    if (bookings.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          <h3 className="text-lg font-medium">No bookings found.</h3>
          <p className="mt-2">
            Why not
            <Link to="/" className="text-indigo-600 hover:underline ml-1">
              book a new movie
            </Link>
            ?
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookings.map((booking) => (
          <BookingCard key={booking._id} booking={booking} />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 sm:p-8"
    >
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
        My Bookings
      </h1>
      {renderContent()}
    </motion.div>
  );
};

export default BookingHistory;