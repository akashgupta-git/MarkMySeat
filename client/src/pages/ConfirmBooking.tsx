import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking } from "../api/auth";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

interface BookingState {
  movieId: string;
  movieTitle: string;
  seatNumbers: string[];
  showTime: string;
  ticketCount: number;
}

const ConfirmBooking: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const state = location.state as BookingState | null;

  const ticketCount = state?.ticketCount ?? state?.seatNumbers?.length ?? 0;
  const ticketPrice = 250;
  const totalAmount = ticketCount * ticketPrice;

  useEffect(() => {
    if (!state) navigate("/");
  }, [state, navigate]);

  const handlePayment = async () => {
    if (!state || ticketCount <= 0 || totalAmount <= 0) {
      setMessage("❌ Invalid ticket count or total amount.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Step 1: Create order from backend
      const res = await axios.post("/api/payment/create-order", {
        amount: totalAmount,
        currency: "INR",
      });

      const { orderId, amount, currency } = res.data;

      // Step 2: Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_aPXIYDn69LCApU",
        amount,
        currency,
        name: "MarkMySeat",
        description: "Movie Ticket Booking",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment
            const verifyRes = await axios.post("/api/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount,
              email: user?.email || "guest@example.com",
            });

            if (verifyRes.data.success) {
              setMessage("✅ Payment verified! Booking confirmed...");

              // Step 4: Save booking for each seat
              await Promise.all(
                state.seatNumbers.map((seat) =>
                  createBooking(state.movieId, seat, state.showTime)
                )
              );

              setTimeout(() => navigate("/success"), 2000);
            } else {
              setMessage("❌ Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification failed:", err);
            setMessage("❌ Payment verification error. Please contact support.");
          }
        },
        prefill: {
          name: user?.name || "Akash",
          email: user?.email || "guest@example.com",
        },
        theme: { color: "#22c55e" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setMessage("❌ Payment initiation failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!state) return null;

  return (
    <div className="flex flex-col items-center p-8">
      <h2 className="text-3xl font-bold mb-6">Confirm Your Booking</h2>

      <div className="bg-white p-6 rounded shadow-md w-full max-w-md text-lg">
        <p><strong>Movie:</strong> {state.movieTitle}</p>
        <p><strong>Seats:</strong> {state.seatNumbers.join(", ")}</p>
        <p><strong>Show Time:</strong> {state.showTime}</p>
        <p><strong>Tickets:</strong> {ticketCount}</p>
        <p><strong>Total:</strong> ₹{isNaN(totalAmount) ? "0" : totalAmount}</p>
      </div>

      <button
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? "Processing..." : "Proceed to Payment"}
      </button>

      {message && <p className="mt-4 text-xl text-blue-600">{message}</p>}
    </div>
  );
};

export default ConfirmBooking;
