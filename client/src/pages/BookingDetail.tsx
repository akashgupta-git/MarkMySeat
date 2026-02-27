import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBookingById, Booking, cancelBooking } from "../api/bookings";
import { getSeatCategory } from "../components/SeatLayout";
import { motion } from "framer-motion";

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/my-bookings");
      return;
    }
    const fetchBooking = async () => {
      try {
        const data = await getBookingById(id);
        setBooking(data);
      } catch (err) {
        setError("Booking not found or access denied.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-gray-400 mb-4">{error || "Booking not found."}</p>
        <Link
          to="/my-bookings"
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
        >
          Back to Bookings
        </Link>
      </div>
    );
  }

  const verifyUrl = `${window.location.origin}/verify/${booking.bookingId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}&bgcolor=0a0a1a&color=ffffff`;

  // Group seats by category for price breakdown
  const seatsByCategory = booking.seatNumbers.reduce(
    (acc, seat) => {
      const cat = getSeatCategory(seat.charAt(0));
      if (!acc[cat.label]) acc[cat.label] = { seats: [], price: cat.price, color: cat.color };
      acc[cat.label].seats.push(seat);
      return acc;
    },
    {} as Record<string, { seats: string[]; price: number; color: string }>
  );

  const bookingDate = new Date(booking.createdAt);

  const handleCancel = async () => {
    if (!booking || !confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      const updated = await cancelBooking(booking._id);
      setBooking(updated);
    } catch (err: any) {
      alert(err.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-6 sm:py-10"
    >
      <div className="max-w-lg mx-auto px-4">
        {/* Back button */}
        <Link
          to="/my-bookings"
          className="text-gray-500 hover:text-gray-300 text-sm mb-6 inline-flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          My Bookings
        </Link>

        {/* Ticket Card */}
        <div className="glass-strong rounded-2xl overflow-hidden">
          {/* Header with poster */}
          <div className="relative">
            {booking.movie?.posterUrl && (
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={booking.movie.posterUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-20 blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-dark-card/60 to-dark-card" />
              </div>
            )}
            <div className="relative p-5 sm:p-6 flex gap-4">
              {booking.movie?.posterUrl && (
                <img
                  src={booking.movie.posterUrl}
                  alt={booking.movie?.title}
                  className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-xl shadow-xl flex-shrink-0 border border-white/10"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
                  E-Ticket
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
                  {booking.movie?.title || "Unknown Movie"}
                </h1>
                {booking.bookingId && (
                  <p className="text-xs text-accent font-mono mt-2 bg-accent/10 inline-block px-3 py-1 rounded-full w-fit">
                    {booking.bookingId}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {booking.movie?.language && (
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                      {booking.movie.language}
                    </span>
                  )}
                  {booking.movie?.genre && (
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                      {booking.movie.genre}
                    </span>
                  )}
                  {booking.movie?.duration && (
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                      {booking.movie.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tear line */}
          <div className="relative px-5">
            <div className="border-t-2 border-dashed border-white/10" />
            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-dark" />
            <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-dark" />
          </div>

          {/* Booking Details */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Show Time & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                  Show Time
                </p>
                <p className="font-semibold text-gray-200 mt-0.5">{booking.showTime}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                  {booking.showDate ? "Show Date" : "Booking Date"}
                </p>
                <p className="font-semibold text-gray-200 mt-0.5">
                  {booking.showDate
                    ? new Date(booking.showDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
                    : bookingDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  }
                </p>
              </div>
            </div>

            {/* Screen Name */}
            {booking.screenName && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                  Screen
                </p>
                <p className="font-semibold text-gray-200 mt-0.5">{booking.screenName}</p>
              </div>
            )}

            {/* Tickets & Seats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                  Tickets
                </p>
                <p className="font-semibold text-gray-200 mt-0.5">{booking.seatNumbers.length}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                  Seats
                </p>
                <p className="font-semibold text-gray-200 mt-0.5">
                  {booking.seatNumbers.sort().join(", ")}
                </p>
              </div>
            </div>

            {/* Seat Category Breakdown */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2.5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                Price Breakdown
              </p>
              {Object.entries(seatsByCategory).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <div>
                    <span className={`font-medium ${data.color}`}>{category}</span>
                    <span className="text-gray-500 ml-1.5">
                      ({data.seats.length} × ₹{data.price})
                    </span>
                  </div>
                  <span className="text-gray-200 font-semibold">
                    ₹{(data.price * data.seats.length).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Total Paid</span>
                <span className="text-lg font-bold gradient-text">
                  ₹{(booking.totalPrice || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                  Payment Method
                </p>
                <p className="font-semibold text-gray-200 mt-0.5">
                  {booking.paymentMethod || "Razorpay"}
                </p>
              </div>
              {booking.paymentId && (
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Payment ID
                  </p>
                  <p className="font-mono text-xs text-gray-400 mt-0.5 truncate">
                    {booking.paymentId}
                  </p>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="flex items-center justify-center">
              {(() => {
                const s = booking.status || "confirmed";
                const cfg = s === "confirmed" ? { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: "M5 13l4 4L19 7" }
                  : s === "used" ? { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
                  : { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: "M6 18L18 6M6 6l12 12" };
                return (
                  <span className={`${cfg.bg} ${cfg.text} text-xs font-semibold px-4 py-2 rounded-full border ${cfg.border} inline-flex items-center gap-1.5`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={cfg.icon} />
                    </svg>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </span>
                );
              })()}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center pt-2">
              <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={qrUrl}
                  alt="Ticket QR Code"
                  className="w-40 h-40 rounded-lg border border-white/10 bg-dark p-1.5"
                />
              </a>
              <p className="text-[10px] text-gray-500 mt-2">Scan to verify this ticket</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {booking.status === "confirmed" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="block w-full text-center bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3.5 rounded-xl font-semibold transition-colors border border-red-500/20 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
          <Link
            to="/my-bookings"
            className="block w-full text-center bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-semibold transition-colors border border-white/5"
          >
            Back to My Bookings
          </Link>
          <Link
            to="/"
            className="block text-center text-gray-500 hover:text-primary text-sm font-medium py-2 transition-colors"
          >
            Browse More Movies
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingDetail;
