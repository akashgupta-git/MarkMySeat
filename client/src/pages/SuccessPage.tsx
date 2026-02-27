import React, { useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface SuccessData {
  bookingId: string;
  bookingMongoId: string;
  movieTitle: string;
  seatNumbers: string[];
  showTime: string;
  showDate?: string;
  screenName?: string;
  totalPrice: number;
}

function generateConfetti(count: number) {
  const colors = ["#dc354f", "#ff6b81", "#06b6d4", "#a855f7", "#22c55e", "#eab308", "#f97316"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[i % colors.length],
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
    shape: Math.random() > 0.5 ? "circle" : "square",
  }));
}

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as SuccessData | undefined;
  const confettiPieces = useMemo(() => generateConfetti(40), []);

  useEffect(() => {
    if (!data) navigate("/");
  }, [data, navigate]);

  if (!data) return null;

  const { bookingId, bookingMongoId, movieTitle, seatNumbers, showTime, showDate, screenName, totalPrice } = data;

  const verifyUrl = `${window.location.origin}/verify/${bookingId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}&bgcolor=0a0a1a&color=ffffff`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.shape === "circle" ? "50%" : "2px",
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        </motion.div>

        <h1 className="text-2xl font-bold text-white text-center mb-1">
          Booking Confirmed!
        </h1>
        <p className="text-gray-400 text-center text-sm mb-8">
          Your tickets have been booked. Enjoy the movie!
        </p>

        {/* E-Ticket Card */}
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary/20 to-indigo-500/10 p-5 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">
              E-Ticket
            </p>
            <h2 className="text-xl font-bold text-white mt-1.5">
              {movieTitle}
            </h2>
            {bookingId && (
              <p className="text-xs text-accent font-mono mt-2 bg-accent/10 inline-block px-3 py-1 rounded-full">
                {bookingId}
              </p>
            )}
          </div>

          {/* Tear line */}
          <div className="relative px-5">
            <div className="border-t-2 border-dashed border-white/10" />
            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-dark" />
            <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-dark" />
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Show Time</p>
                <p className="font-semibold text-gray-200 mt-0.5">{showTime}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Tickets</p>
                <p className="font-semibold text-gray-200 mt-0.5">{seatNumbers.length}</p>
              </div>
            </div>

            {(showDate || screenName) && (
              <div className="flex justify-between">
                {showDate && (
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Date</p>
                    <p className="font-semibold text-gray-200 mt-0.5">
                      {new Date(showDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                )}
                {screenName && (
                  <div className={showDate ? "text-right" : ""}>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Screen</p>
                    <p className="font-semibold text-gray-200 mt-0.5">{screenName}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Seats</p>
              <p className="font-semibold text-gray-200 mt-0.5">{seatNumbers.sort().join(", ")}</p>
            </div>

            {totalPrice > 0 && (
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Amount Paid</p>
                <p className="text-2xl font-bold gradient-text mt-1">₹{totalPrice.toLocaleString()}</p>
              </div>
            )}

            {/* QR Code */}
            <div className="flex flex-col items-center pt-2">
              <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={qrUrl}
                  alt="Ticket QR Code"
                  className="w-36 h-36 rounded-lg border border-white/10 bg-dark p-1"
                />
              </a>
              <p className="text-[10px] text-gray-500 mt-2">Scan or tap to view your ticket</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {bookingMongoId && (
            <Link
              to={`/booking/${bookingMongoId}`}
              className="block w-full text-center bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-primary/20"
            >
              View Full Ticket
            </Link>
          )}
          <Link
            to="/my-bookings"
            className="block w-full text-center bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-semibold transition-colors border border-white/5"
          >
            View All Bookings
          </Link>
          <Link
            to="/"
            className="block text-center text-gray-500 hover:text-primary text-sm font-medium py-2 transition-colors"
          >
            Browse More Movies
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
