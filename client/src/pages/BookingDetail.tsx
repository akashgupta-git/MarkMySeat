import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBookingById, Booking, cancelBooking } from "../api/bookings";
import { getSeatCategory } from "../components/SeatLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Clock, Calendar, MapPin, Armchair, QrCode, CreditCard,
  CheckCircle, XCircle, BadgeCheck, Film, Ticket,
} from "lucide-react";

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
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600 text-xs mt-4">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-gray-400 mb-4">{error || "Booking not found."}</p>
        <Link
          to="/my-bookings"
          className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
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
      toast.success("Booking cancelled successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    } finally {
      setCancelling(false);
    }
  };

  const statusConfig = (() => {
    const s = booking.status || "confirmed";
    if (s === "confirmed") return { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: <CheckCircle className="w-4 h-4" />, label: "Confirmed" };
    if (s === "used") return { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: <BadgeCheck className="w-4 h-4" />, label: "Used" };
    return { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: <XCircle className="w-4 h-4" />, label: "Cancelled" };
  })();

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
          className="text-gray-500 hover:text-white text-sm mb-6 inline-flex items-center gap-1.5 transition-all duration-300 hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
          My Bookings
        </Link>

        {/* Ticket Card */}
        <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
          {/* Header with poster */}
          <div className="relative">
            {booking.movie?.posterUrl && (
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={booking.movie.posterUrl}
                  alt=""
                  className="w-full h-full object-cover opacity-15 blur-2xl scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f25]/60 to-[#0f0f25]" />
              </div>
            )}
            <div className="relative p-5 sm:p-6 flex gap-4">
              {booking.movie?.posterUrl && (
                <img
                  src={booking.movie.posterUrl}
                  alt={booking.movie?.title}
                  className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-xl shadow-2xl shadow-black/50 flex-shrink-0 border border-white/10"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
              <div className="flex flex-col justify-center min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                  <Ticket className="w-3 h-3" />
                  E-Ticket
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
                  {booking.movie?.title || "Unknown Movie"}
                </h1>
                {booking.bookingId && (
                  <p className="text-xs text-primary font-mono mt-2 bg-primary/10 inline-block px-3 py-1 rounded-full w-fit font-bold border border-primary/20">
                    {booking.bookingId}
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {booking.movie?.language && (
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full border border-white/5">
                      {booking.movie.language}
                    </span>
                  )}
                  {booking.movie?.genre && (
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full border border-white/5">
                      {booking.movie.genre}
                    </span>
                  )}
                  {booking.movie?.duration && (
                    <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full border border-white/5 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {booking.movie.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tear line */}
          <div className="ticket-tear" />

          {/* Booking Details */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Show Time & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Show Time
                </p>
                <p className="font-semibold text-gray-200 mt-1 text-sm">{booking.showTime}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {booking.showDate ? "Show Date" : "Booked On"}
                </p>
                <p className="font-semibold text-gray-200 mt-1 text-sm">
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
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Screen
                </p>
                <p className="font-semibold text-gray-200 mt-1 text-sm">{booking.screenName}</p>
              </div>
            )}

            {/* Seats */}
            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1">
                <Armchair className="w-3 h-3" /> Seats ({booking.seatNumbers.length})
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {booking.seatNumbers.sort().map((seat) => (
                  <span key={seat} className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-mono font-bold border border-emerald-500/20">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* Seat Category Breakdown */}
            <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.04] space-y-2.5">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                Price Breakdown
              </p>
              {Object.entries(seatsByCategory).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <div>
                    <span className={`font-medium ${data.color}`}>{category}</span>
                    <span className="text-gray-600 ml-1.5">
                      ({data.seats.length} x ₹{data.price})
                    </span>
                  </div>
                  <span className="text-gray-200 font-semibold">
                    ₹{(data.price * data.seats.length).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="border-t border-white/[0.06] pt-2.5 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Total Paid</span>
                <span className="text-lg font-bold gradient-text-gold">
                  ₹{(booking.totalPrice || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Payment
                </p>
                <p className="font-semibold text-gray-200 mt-1 text-sm">
                  {booking.paymentMethod || "Razorpay"}
                </p>
              </div>
              {booking.paymentId && (
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">
                    Payment ID
                  </p>
                  <p className="font-mono text-[10px] text-gray-500 mt-1 truncate">
                    {booking.paymentId}
                  </p>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className="flex items-center justify-center">
              <span className={`${statusConfig.bg} ${statusConfig.text} text-xs font-bold px-5 py-2 rounded-full border ${statusConfig.border} inline-flex items-center gap-1.5 uppercase tracking-wider`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center pt-2">
              <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="group">
                <div className="relative">
                  <img
                    src={qrUrl}
                    alt="Ticket QR Code"
                    className="w-40 h-40 rounded-xl border border-white/10 bg-[#0a0a1a] p-2 transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-white/5 group-hover:ring-primary/30 transition-all" />
                </div>
              </a>
              <p className="text-[10px] text-gray-600 mt-2 flex items-center gap-1">
                <QrCode className="w-3 h-3" /> Scan at venue for entry
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {booking.status === "confirmed" && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/15 text-red-400 py-3.5 rounded-xl font-semibold transition-all duration-300 border border-red-500/20 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
          <Link
            to="/my-bookings"
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 border border-white/[0.06]"
          >
            <Ticket className="w-4 h-4" />
            Back to My Bookings
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 text-gray-500 hover:text-primary text-sm font-medium py-2 transition-colors"
          >
            <Film className="w-3.5 h-3.5" />
            Browse More Movies
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingDetail;