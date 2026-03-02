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
import { toast } from "sonner";
import {
  ArrowLeft, Clock, ShieldCheck, CreditCard,
  ChevronDown, Minus, Plus, Timer, Armchair, MapPin, Ticket,
} from "lucide-react";

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

const LOCK_DURATION_SECONDS = 10 * 60; // 10 minutes

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

  // Countdown timer for seat hold
  const [timeLeft, setTimeLeft] = useState(LOCK_DURATION_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          // Start countdown timer
          timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [bookingData]);

  // When timer expires, redirect back
  useEffect(() => {
    if (timeLeft === 0 && bookingData) {
      toast.error("Seat hold expired. Please select your seats again.");
      navigate(`/book/${bookingData.movieId}`);
    }
  }, [timeLeft, bookingData, navigate]);

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

  // Countdown display
  const countdownMins = Math.floor(timeLeft / 60);
  const countdownSecs = timeLeft % 60;
  const isUrgent = timeLeft <= 120; // under 2 minutes

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    setStatus("Loading payment gateway...");

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Check your internet connection.");
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
              if (timerRef.current) clearInterval(timerRef.current);
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
              toast.error("Payment verification failed. Contact support if amount was deducted.");
            }
          } catch (err: any) {
            toast.error(err.message || "Booking failed after payment. Contact support.");
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
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
        setStatus("");
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment.");
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
          className="text-gray-500 hover:text-white text-sm mb-5 inline-flex items-center gap-1.5 transition-all duration-300 hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Modify selection
        </button>

        {/* Header with countdown */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">
            Booking Summary
          </h1>

          {/* Countdown Timer */}
          {seatsLocked && timeLeft > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-mono font-bold ${
                isUrgent
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}
            >
              <Timer className={`w-4 h-4 ${isUrgent ? "animate-pulse" : ""}`} />
              <span>{String(countdownMins).padStart(2, "0")}:{String(countdownSecs).padStart(2, "0")}</span>
            </motion.div>
          )}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
          {/* Movie banner */}
          <div className="relative overflow-hidden">
            {posterUrl && (
              <div className="absolute inset-0">
                <img src={posterUrl} alt="" className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0f0f25]" />
              </div>
            )}
            <div className="relative flex gap-4 p-5 sm:p-6">
              {posterUrl && (
                <img
                  src={posterUrl}
                  alt={movieTitle}
                  className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-lg shadow-2xl shadow-black/50 flex-shrink-0 border border-white/10"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex flex-col justify-center min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                  {movieTitle}
                </h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/5">
                    <Clock className="w-3 h-3" />
                    {showTime}
                  </span>
                  {showDate && (
                    <span className="text-xs bg-white/10 text-gray-300 px-2.5 py-1 rounded-full border border-white/5">
                      {new Date(showDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                    </span>
                  )}
                  {screenName && (
                    <span className="text-xs bg-indigo-500/15 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {screenName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Armchair className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-gray-400">
                    <span className="text-white font-semibold">{seatNumbers.length}</span> seat{seatNumbers.length > 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="p-5 sm:p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Ticket className="w-3.5 h-3.5" />
              Price Breakdown
            </h3>

            {Object.entries(seatsByCategory).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-white/[0.02]">
                <div>
                  <p className="font-medium text-gray-200 text-sm">
                    {category}{" "}
                    <span className="text-gray-500 font-normal">
                      x{data.seats.length}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 font-mono">
                    {data.seats.sort().join(", ")}
                  </p>
                </div>
                <p className="font-semibold text-white text-sm">
                  ₹{(data.price * data.seats.length).toLocaleString()}
                </p>
              </div>
            ))}

            <div className="border-t border-white/[0.04] pt-4">
              {/* Food add-on toggle */}
              {foodMenu.length > 0 && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowFood(!showFood)}
                    className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🍿</span>
                      <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Add Snacks & Beverages</span>
                      {foodTotal > 0 && (
                        <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">+₹{foodTotal}</span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showFood ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showFood && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-1.5">
                          {foodMenu.map((item) => (
                            <div key={item._id} className="flex items-center gap-3 py-3 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/[0.04]">
                              {item.imageUrl && (
                                <img src={item.imageUrl} alt={item.name} className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 border ${item.isVeg ? "bg-emerald-500 border-emerald-400" : "bg-red-500 border-red-400"}`} />
                                  <p className="text-sm font-medium text-gray-200 truncate">{item.name}</p>
                                </div>
                                <p className="text-xs text-gray-500 font-semibold mt-0.5">₹{item.price}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {(foodCart[item._id] || 0) > 0 ? (
                                  <>
                                    <button onClick={() => updateFoodQty(item._id, -1)} className="w-7 h-7 rounded-full bg-white/10 text-white text-sm flex items-center justify-center hover:bg-white/20 transition-all">
                                      <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-sm font-bold text-white w-5 text-center">{foodCart[item._id]}</span>
                                    <button onClick={() => updateFoodQty(item._id, 1)} className="w-7 h-7 rounded-full bg-primary text-white text-sm flex items-center justify-center hover:bg-primary-dark transition-all">
                                      <Plus className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => updateFoodQty(item._id, 1)} className="text-xs text-primary font-bold px-3.5 py-1.5 rounded-full border border-primary/30 hover:bg-primary/10 transition-all">ADD</button>
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
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tickets</span>
                    <span className="text-gray-300 font-medium">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Snacks & Beverages</span>
                    <span className="text-gray-300 font-medium">₹{foodTotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/[0.04]" />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-white">Total</p>
                  <p className="text-[11px] text-gray-600">
                    {seatNumbers.length} ticket{seatNumbers.length > 1 ? "s" : ""}{foodTotal > 0 ? " + snacks" : ""} incl. taxes
                  </p>
                </div>
                <p className="text-2xl font-bold gradient-text-gold">
                  ₹{grandTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-5 sm:mx-6 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-sm flex items-start gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Status indicator */}
          {status && (
            <div className="mx-5 sm:mx-6 mb-4 text-gray-400 text-sm text-center flex items-center justify-center gap-2">
              <div className="animate-spin h-3.5 w-3.5 border-2 border-primary/30 border-t-primary rounded-full" />
              {status}
            </div>
          )}

          {/* Pay button */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <button
              onClick={handlePay}
              disabled={loading || timeLeft === 0}
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 text-sm sm:text-base group flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Processing...
                </span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Pay ₹{grandTotal.toLocaleString()}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security note */}
        <p className="text-center text-xs text-gray-600 mt-5 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Secured by Razorpay — 256-bit encryption
        </p>
      </div>
    </motion.div>
  );
};

export default ConfirmBooking;