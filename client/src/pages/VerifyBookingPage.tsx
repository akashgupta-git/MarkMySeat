import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { verifyBooking, VerifiedBooking } from "../api/bookings";
import { motion } from "framer-motion";

const VerifyBookingPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<VerifiedBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!bookingId) {
        setError("No booking ID provided.");
        setLoading(false);
        return;
      }
      try {
        const data = await verifyBooking(bookingId);
        setBooking(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Booking not found.");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invalid Ticket</h2>
          <p className="text-gray-400 text-sm">{error || "This booking could not be verified."}</p>
        </motion.div>
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
    confirmed: {
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: "M5 13l4 4L19 7",
      label: "Valid Ticket",
    },
    used: {
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      label: "Already Used",
    },
    cancelled: {
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
      icon: "M6 18L18 6M6 6l12 12",
      label: "Cancelled",
    },
  };

  const status = statusConfig[booking.status] || statusConfig.confirmed;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Status indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`mx-auto w-20 h-20 ${status.bg} rounded-full flex items-center justify-center mb-6`}
        >
          <svg className={`w-10 h-10 ${status.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={status.icon} />
          </svg>
        </motion.div>

        <h1 className={`text-2xl font-bold text-center mb-1 ${status.color}`}>{status.label}</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Ticket Verification</p>

        {/* Ticket Details */}
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-indigo-500/10 p-5 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">Movie</p>
            <h2 className="text-xl font-bold text-white mt-1">{booking.movie}</h2>
            <p className="text-xs text-accent font-mono mt-2 bg-accent/10 inline-block px-3 py-1 rounded-full">
              {booking.bookingId}
            </p>
          </div>

          {/* Tear line */}
          <div className="relative px-5">
            <div className="border-t-2 border-dashed border-white/10" />
            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-dark" />
            <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-dark" />
          </div>

          <div className="p-5 space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Show Time</p>
                <p className="font-semibold text-gray-200 mt-0.5">{booking.showTime}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Tickets</p>
                <p className="font-semibold text-gray-200 mt-0.5">{booking.ticketCount}</p>
              </div>
            </div>

            {(booking.showDate || booking.screenName) && (
              <div className="flex justify-between">
                {booking.showDate && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Date</p>
                    <p className="font-semibold text-gray-200 mt-0.5">
                      {new Date(booking.showDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                  </div>
                )}
                {booking.screenName && (
                  <div className={booking.showDate ? "text-right" : ""}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Screen</p>
                    <p className="font-semibold text-gray-200 mt-0.5">{booking.screenName}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Seats</p>
              <p className="font-semibold text-gray-200 mt-0.5">{booking.seats.join(", ")}</p>
            </div>

            <div className={`rounded-xl p-3 text-center border ${status.bg} ${status.border}`}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Status</p>
              <p className={`text-lg font-bold mt-0.5 ${status.color}`}>{booking.status.toUpperCase()}</p>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-600 mt-4">
          MarkMySeat · Verified at {new Date().toLocaleString()}
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyBookingPage;
