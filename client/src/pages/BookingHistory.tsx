import React, { useEffect, useState } from "react";
import { getMyBookings, cancelBooking, Booking } from "../api/bookings";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Ticket, Clock, MapPin, Calendar, ChevronRight, Film, XCircle, Armchair } from "lucide-react";

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err) {
      toast.error("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Cancel this booking?")) return;
    setCancellingId(id);
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-600 text-xs mt-4">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-8"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Ticket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              My Bookings
            </h1>
            {bookings.length > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">{bookings.length} booking{bookings.length > 1 ? "s" : ""}</p>
            )}
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-10 h-10 text-gray-700" />
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Start by booking your first movie!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-all duration-300 shadow-lg shadow-primary/25"
            >
              <Film className="w-4 h-4" />
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking, i) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link
                  to={`/booking/${booking._id}`}
                  className="block glass-card rounded-2xl overflow-hidden hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 group border border-white/[0.04]"
                >
                  <div className="p-5 sm:p-6 flex items-start gap-4">
                    {/* Movie poster thumbnail */}
                    {booking.movie?.posterUrl && (
                      <img
                        src={booking.movie.posterUrl}
                        alt={booking.movie?.title}
                        className="w-14 h-20 sm:w-16 sm:h-24 object-cover rounded-lg shadow-lg flex-shrink-0 border border-white/10"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-white truncate group-hover:text-primary-light transition-colors">
                            {booking.movie?.title || "Unknown Movie"}
                          </h2>
                          {booking.bookingId && (
                            <p className="text-[10px] text-primary font-mono mt-0.5 font-bold">
                              {booking.bookingId}
                            </p>
                          )}
                        </div>
                        {(() => {
                          const s = booking.status || "confirmed";
                          const cfg = s === "confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : s === "used" ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20";
                          return (
                            <span className={`${cfg} text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 border uppercase tracking-wider`}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-600" />
                          {booking.showTime}
                        </span>
                        {booking.screenName && (
                          <span className="inline-flex items-center gap-1.5 text-indigo-300">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            {booking.screenName}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <Armchair className="w-3.5 h-3.5 text-gray-600" />
                          {booking.seatNumbers?.join(", ") || "N/A"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-600" />
                          {booking.showDate
                            ? new Date(booking.showDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            : new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2.5">
                        {booking.totalPrice > 0 && (
                          <p className="text-sm font-bold gradient-text-gold">
                            ₹{booking.totalPrice.toLocaleString()}
                          </p>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={(e) => handleCancel(booking._id, e)}
                            disabled={cancellingId === booking._id}
                            className="text-[10px] text-red-400 hover:text-red-300 px-2 py-0.5 rounded-md border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-50 inline-flex items-center gap-1 font-bold"
                          >
                            <XCircle className="w-3 h-3" />
                            {cancellingId === booking._id ? "..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-gray-400 flex-shrink-0 self-center transition-all group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BookingHistory;