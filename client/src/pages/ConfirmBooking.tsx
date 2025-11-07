import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../api/bookings";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

// This interface defines the data we expect from BookingPage
interface BookingData {
  movieId: string;
  movieTitle: string;
  posterUrl?: string;
  seatNumbers: string[];
  showTime: string;
  totalPrice: number;
}

const ConfirmBooking: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get booking details passed from BookingPage
  const {
    movieId,
    movieTitle,
    posterUrl,
    seatNumbers,
    showTime,
    totalPrice,
  } = (location.state as BookingData) || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If no data was passed, redirect to home
  if (!movieId || !seatNumbers || seatNumbers.length === 0) {
    // This timeout prevents a render-loop error
    setTimeout(() => navigate("/"), 1);
    return null;
  }

  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Create the booking in our database
      const bookingResponse = await createBooking(movieId, seatNumbers, showTime);

      // 2. Here you would normally call your payment API (e.g., Razorpay)
      // For this example, we'll simulate a successful payment
      console.log("Booking created:", bookingResponse);
      
      // 3. (Simulating payment)
      // const payment = await initiatePayment(totalPrice, bookingResponse.booking._id);
      // if (payment.success) { ... }

      // 4. On success, navigate to the success page
      navigate("/success", {
        state: {
          movieTitle,
          seatNumbers,
          showTime,
        },
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-4 sm:p-8"
    >
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <h1 className="text-3xl font-bold text-gray-900 p-6 border-b">
          Confirm Your Booking
        </h1>
        
        <div className="md:flex">
          {/* Left Side: Movie Details */}
          <div className="md:w-1/3 p-6">
            <img
              src={posterUrl || "/fallback.jpg"}
              alt={movieTitle}
              className="rounded-lg shadow-md object-cover"
            />
          </div>

          {/* Right Side: Booking Summary */}
          <div className="md:w-2/3 p-6">
            <h2 className="text-2xl font-semibold text-indigo-600">
              {movieTitle}
            </h2>
            
            <div className="mt-4 space-y-3 text-gray-700">
              <p>
                <strong>Show Time:</strong> {showTime}
              </p>
              <p>
                <strong>Seats:</strong>
                <span className="ml-2 font-bold text-gray-900">
                  {seatNumbers.join(", ")}
                </span>
              </p>
              <p>
                <strong>Tickets:</strong> {seatNumbers.length}
              </p>
              <hr className="my-3" />
              <p className="text-2xl font-bold text-gray-900">
                <strong>Total Price:</strong>
                <span className="ml-2 text-indigo-600">₹{totalPrice || 150 * seatNumbers.length}</span>
              </p>
            </div>
            
            {error && (
              <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-lg">
                <strong>Error:</strong> {error}
              </div>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="mt-6 w-full bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold
                         hover:bg-green-700 transition-all duration-300
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Confirm & Pay"}
            </button>
            
            <button
              onClick={() => navigate(`/book/${movieId}`)}
              disabled={loading}
              className="mt-3 w-full text-center text-gray-600 hover:text-indigo-600"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ConfirmBooking;