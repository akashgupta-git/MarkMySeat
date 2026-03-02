import React, { useState, useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createBooking, lockSeats, unlockSeats } from "../api/bookings";
import { createPaymentOrder, verifyPayment } from "../api/payment";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { getSeatCategory } from "../components/SeatLayout";
import loadRazorpay from "../utils/loadRazorpay";
import { getFoodMenu } from "../api/theatre";
import { FoodItem, FoodOrderItem, SeatCategory, SeatConfig } from "../types/User";

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
  showDate?: string;
  totalPrice: number;
  theatreId?: string;
  screenName?: string;
  seatConfig?: SeatConfig | null;
}

const ConfirmBooking: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state as BookingData | undefined;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [seatsLocked, setSeatsLocked] = useState(false);
  const lockAttempted = useRef(false);

  // Food add-on state
  const [foodMenu, setFoodMenu] = useState<FoodItem[]>([]);
  const [foodCart, setFoodCart] = useState<Record<string, number>>({});
  const [showFood, setShowFood] = useState(false);
  const [foodLoading, setFoodLoading] = useState(false);

  // Lock seats in Redis as soon as user lands on this page
  useEffect(() => {
    if (!bookingData || lockAttempted.current) return;
    lockAttempted.current = true;

    const acquireLock = async () => {
      try {
        const result = await lockSeats(
          bookingData.movieId,
          bookingData.seatNumbers,
          bookingData.showTime,
          bookingData.showDate,
        );
        if (result.locked) {
          setSeatsLocked(true);
        } else {
          setError(
            `Some seats were just taken by another user: ${result.conflicting?.join(", ")}. Please go back and pick different seats.`
          );
        }
      } catch (err: any) {
        // Non-critical — Redis might be unavailable, booking will still work via DB check
        console.warn("Seat lock failed (non-critical):", err.message);
        setSeatsLocked(true); // proceed anyway — DB transaction is the safety net
      }
    };
    acquireLock();
  }, [bookingData]);

  // Release seats if user navigates away without completing booking
  useEffect(() => {
    if (!bookingData) return;

    const releaseLock = () => {
      if (seatsLocked) {
        unlockSeats(
          bookingData.movieId,
          bookingData.seatNumbers,
          bookingData.showTime,
          bookingData.showDate,
        );
      }
    };

    // Handle browser tab close / navigation
    window.addEventListener("beforeunload", releaseLock);

    return () => {
      window.removeEventListener("beforeunload", releaseLock);
      // Component unmount — release unless booking succeeded (navigated to /success)
      if (seatsLocked && !window.location.pathname.includes("/success")) {
        releaseLock();
      }
    };
  }, [bookingData, seatsLocked]);

  useEffect(() => {
    const loadFood = async () => {
      setFoodLoading(true);
      try {
        const items = await getFoodMenu(bookingData?.theatreId);
        setFoodMenu(items.filter((f) => f.isAvailable));
      } catch {
        // silently fail — food is optional
      } finally {
        setFoodLoading(false);
      }
    };
    if (bookingData) loadFood();
  }, [bookingData?.theatreId]);

  if (!bookingData || !bookingData.movieId || !bookingData.seatNumbers?.length) {
    setTimeout(() => navigate("/"), 10);
    return null;
  }

  const { movieId, movieTitle, posterUrl, seatNumbers, showTime, totalPrice, showDate, screenName, seatConfig } =
    bookingData;

  const categories = seatConfig?.categories;

  // group seats by category for price breakdown
  const seatsByCategory = seatNumbers.reduce(
    (acc, seat) => {
      const cat = getSeatCategory(seat.charAt(0), categories);
      if (!acc[cat.label]) acc[cat.label] = { seats: [], price: cat.price };
      acc[cat.label].seats.push(seat);
      return acc;
    },
    {} as Record<string, { seats: string[]; price: number }>
  );

  // food helpers
  const updateFoodQty = (itemId: string, delta: number) => {
    setFoodCart((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const foodTotal = foodMenu.reduce((sum, item) => sum + (foodCart[item._id] || 0) * item.price, 0);
  const grandTotal = totalPrice + foodTotal;

  const foodOrders: FoodOrderItem[] = foodMenu
    .filter((f) => foodCart[f._id] > 0)
    .map((f) => ({ item: f._id, name: f.name, quantity: foodCart[f._id], price: f.price }));

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
      const { orderId } = await createPaymentOrder(grandTotal);

      setStatus("");

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_aPXIYDn69LCApU",
        amount: grandTotal * 100,
        currency: "INR",
        name: "MarkMySeat",
        description: `${movieTitle} - ${seatNumbers.length} ticket(s)${foodOrders.length ? " + snacks" : ""}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            setLoading(true);
            setStatus("Verifying payment...");

            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: grandTotal,
              email: user?.email || "",
            });

            if (verification.success) {
              setStatus("Confirming your seats...");
              const result = await createBooking(movieId, seatNumbers, showTime, grandTotal, verification.paymentId, foodOrders.length > 0 ? foodOrders : undefined, foodTotal || undefined, showDate);
              // Booking succeeded — prevent cleanup from releasing locks
              setSeatsLocked(false);
              navigate("/success", {
                state: {
                  bookingId: result.booking?.bookingId || "",
                  bookingMongoId: result.booking?._id || "",
                  movieTitle,
                  seatNumbers,
                  showTime,
                  showDate: showDate || "",
                  screenName: screenName || "",
                  totalPrice: grandTotal,
                },
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
          contact: "9999999999",
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
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full">
                  {showTime}
                </span>
                {showDate && (
                  <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-0.5 rounded-full">
                    {new Date(showDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                )}
                {screenName && (
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full">
                    {screenName}
                  </span>
                )}
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
              {/* Food add-on toggle */}
              {foodMenu.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowFood(!showFood)}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍿</span>
                      <span className="text-sm font-medium text-gray-200 group-hover:text-white">Add Snacks & Beverages</span>
                      {foodTotal > 0 && (
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">₹{foodTotal}</span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${showFood ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {showFood && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-2">
                          {foodMenu.map((item) => (
                            <div key={item._id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${item.isVeg ? "bg-emerald-500" : "bg-red-500"}`} />
                                  <p className="text-sm font-medium text-gray-200 truncate">{item.name}</p>
                                </div>
                                <p className="text-xs text-gray-500">₹{item.price}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {(foodCart[item._id] || 0) > 0 ? (
                                  <>
                                    <button onClick={() => updateFoodQty(item._id, -1)} className="w-7 h-7 rounded-full bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20 transition-all">−</button>
                                    <span className="text-sm font-semibold text-white w-4 text-center">{foodCart[item._id]}</span>
                                    <button onClick={() => updateFoodQty(item._id, 1)} className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center hover:bg-primary-dark transition-all">+</button>
                                  </>
                                ) : (
                                  <button onClick={() => updateFoodQty(item._id, 1)} className="text-xs text-primary font-semibold px-3 py-1.5 rounded-full border border-primary/30 hover:bg-primary/10 transition-all">ADD</button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Subtotals */}
              {foodTotal > 0 && (
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Tickets</span>
                    <span className="text-gray-300">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Snacks & Beverages</span>
                    <span className="text-gray-300">₹{foodTotal.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-white">Total Amount</p>
                  <p className="text-xs text-gray-500">
                    {seatNumbers.length} ticket{seatNumbers.length > 1 ? "s" : ""}{foodTotal > 0 ? " + snacks" : ""} incl. taxes
                  </p>
                </div>
                <p className="text-2xl font-bold gradient-text">
                  ₹{grandTotal.toLocaleString()}
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
                `Pay ₹${grandTotal.toLocaleString()}`
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