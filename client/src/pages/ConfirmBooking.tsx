import React, { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../api/bookings";
import { createPaymentOrder, verifyPayment } from "../api/payment";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { getSeatCategory } from "../components/SeatLayout";
import loadRazorpay from "../utils/loadRazorpay";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const bookingData = location.state as BookingData | undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  if (!bookingData || !bookingData.movieId || !bookingData.seatNumbers?.length) {
    setTimeout(() => navigate("/"), 10);
    return null;
  }

  const { movieId, movieTitle, posterUrl, seatNumbers, showTime, totalPrice } =
    bookingData;

  // group seats by category for price breakdown
  const seatsByCategory = seatNumbers.reduce(
    (acc, seat) => {
      const cat = getSeatCategory(seat.charAt(0));
      if (!acc[cat.label]) acc[cat.label] = { seats: [], price: cat.price };
      acc[cat.label].seats.push(seat);
      return acc;
    },
    {} as Record<string, { seats: string[]; price: number }>
  );

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    setStatus("Loading payment gateway...");

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        setError("Failed to load payment gateway. Check your internet connection.");
        setLoading(false);
        setStatus("");
        return;
      }

      setStatus("Creating order...");
      const { orderId } = await createPaymentOrder(totalPrice);

      setStatus("");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_aPXIYDn69LCApU",
        amount: totalPrice * 100,
        currency: "INR",
        name: "MarkMySeat",
        description: `${movieTitle} - ${seatNumbers.length} ticket(s)`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            setLoading(true);
            setStatus("Verifying payment...");

            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: totalPrice,
              email: user?.email || "",
            });

            if (verification.success) {
              setStatus("Confirming your seats...");
              await createBooking(movieId, seatNumbers, showTime);
              navigate("/success", {
                state: { movieTitle, seatNumbers, showTime, totalPrice },
              });
            } else {
              setError("Payment verification failed. Contact support if amount was deducted.");
            }
          } catch (err: any) {
            setError(err.message || "Booking failed after payment. Contact support.");
          } finally {
            setLoading(false);
            setStatus("");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#dc354f",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatus("");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
        setStatus("");
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment.");
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-6 sm:py-10"
    >
      <div className="max-w-2xl mx-auto px-4">
        {/* Back link */}
        <button
          onClick={() => navigate(`/book/${movieId}`)}
          className="text-gray-500 hover:text-gray-300 text-sm mb-4 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Modify selection
        </button>

        <h1 className="text-2xl font-bold text-white mb-6">
          Booking Summary
        </h1>

        <div className="glass-strong rounded-2xl overflow-hidden">
          {/* Movie banner */}
          <div className="flex gap-4 p-5 sm:p-6 bg-gradient-to-r from-primary/20 to-indigo-500/10">
            {posterUrl && (
              <img
                src={posterUrl}
                alt={movieTitle}
                className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-lg shadow-lg flex-shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div className="flex flex-col justify-center min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                {movieTitle}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full">
                  {showTime}
                </span>
                <span className="text-xs text-gray-400">
                  {seatNumbers.length} seat{seatNumbers.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Price Breakdown
            </h3>

            {Object.entries(seatsByCategory).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-200 text-sm">
                    {category}{" "}
                    <span className="text-gray-500 font-normal">
                      ({data.seats.length} ticket{data.seats.length > 1 ? "s" : ""})
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Seats: {data.seats.sort().join(", ")}
                  </p>
                </div>
                <p className="font-semibold text-gray-200 text-sm">
                  ₹{(data.price * data.seats.length).toLocaleString()}
                </p>
              </div>
            ))}

            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-white">Total Amount</p>
                  <p className="text-xs text-gray-500">
                    {seatNumbers.length} ticket{seatNumbers.length > 1 ? "s" : ""} incl. taxes
                  </p>
                </div>
                <p className="text-2xl font-bold gradient-text">
                  ₹{totalPrice.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-5 sm:mx-6 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Status indicator */}
          {status && (
            <div className="mx-5 sm:mx-6 mb-4 text-gray-400 text-sm text-center flex items-center justify-center gap-2">
              <div className="animate-spin h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full" />
              {status}
            </div>
          )}

          {/* Pay button */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-sm sm:text-base"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Processing...
                </span>
              ) : (
                `Pay ₹${totalPrice.toLocaleString()}`
              )}
            </button>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-gray-600 mt-4 flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secured by Razorpay
        </p>
      </div>
    </motion.div>
  );
};

export default ConfirmBooking;
