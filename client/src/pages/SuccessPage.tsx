import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data passed from ConfirmBooking page
  const { movieTitle, seatNumbers, showTime } = (location.state as {
    movieTitle: string;
    seatNumbers: string[];
    showTime: string;
  }) || {};

  // If no state was passed, send to home
  if (!movieTitle) {
    setTimeout(() => navigate("/"), 1);
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4"
    >
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
        >
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Booking Confirmed!
        </h1>
        <p className="text-gray-600 mt-2">
          Your ticket is ready. Enjoy the show!
        </p>

        {/* Ticket Details */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-8 text-left space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
            Your E-Ticket
          </h2>
          <div>
            <span className="text-sm text-gray-500">Movie</span>
            <p className="font-semibold text-indigo-600 text-lg">
              {movieTitle}
            </p>
          </div>
          <div className="flex justify-between">
            <div>
              <span className="text-sm text-gray-500">Show Time</span>
              <p className="font-semibold text-gray-800">{showTime}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Seats</span>
              <p className="font-semibold text-gray-800">
                {seatNumbers.join(", ")}
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/my-bookings"
          className="block w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          View All My Bookings
        </Link>
        <Link
          to="/"
          className="block mt-3 text-sm text-gray-600 hover:text-indigo-600"
        >
          Back to Home
        </Link>
      </div>
    </motion.div>
  );
};

export default SuccessPage;