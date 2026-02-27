import React, { useEffect, useState } from "react";
import { getMyBookings, cancelBooking, Booking } from "../api/bookings";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const BookingHistory: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError("Failed to load your bookings.");
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
      fetchBookings();
    } catch (err: any) {
      alert(err.message || "Failed to cancel");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          My Bookings
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              No bookings yet
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Start by booking your first movie!
            </p>
            <Link
              to="/"
              className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
            >
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
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link
                  to={`/booking/${booking._id}`}
                  className="block glass-strong rounded-2xl overflow-hidden hover:border-white/10 hover:bg-white/[0.03] transition-all duration-200 group"
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
                          <h2 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors">
                            {booking.movie?.title || "Unknown Movie"}
                          </h2>
                          {booking.bookingId && (
                            <p className="text-[10px] text-accent font-mono mt-0.5">
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
                            <span className={`${cfg} text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 border`}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {booking.showTime}
                        </span>
                        {booking.screenName && (
                          <span className="inline-flex items-center gap-1.5 text-indigo-300">
                            <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {booking.screenName}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                          </svg>
                          {booking.seatNumbers?.join(", ") || "N/A"}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {booking.showDate
                            ? new Date(booking.showDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                            : new Date(booking.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {booking.totalPrice > 0 && (
                          <p className="text-sm font-semibold gradient-text">
                            ₹{booking.totalPrice.toLocaleString()}
                          </p>
                        )}
                        {booking.status === "confirmed" && (
                          <button
                            onClick={(e) => handleCancel(booking._id, e)}
                            disabled={cancellingId === booking._id}
                            className="text-[10px] text-red-400 hover:text-red-300 px-2 py-0.5 rounded border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-50"
                          >
                            {cancellingId === booking._id ? "..." : "Cancel"}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Chevron arrow */}
                    <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-400 flex-shrink-0 self-center transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
