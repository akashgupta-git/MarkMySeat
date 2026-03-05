import React, { useEffect, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Ticket, Eye, Film, QrCode, Calendar, MapPin, Clock, Armchair } from "lucide-react";

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

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state as SuccessData | undefined;
  const confettiFired = useRef(false);

  useEffect(() => {
    if (!data) { navigate("/"); return; }
    if (confettiFired.current) return;
    confettiFired.current = true;

    // Fire multiple confetti bursts for celebration
    const duration = 3000;
    const end = Date.now() + duration;
    const colors = ["#dc354f", "#ff6b81", "#06b6d4", "#a855f7", "#22c55e", "#eab308"];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // big burst after delay
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.6 },
        colors,
        startVelocity: 30,
        gravity: 0.8,
        scalar: 1.2,
      });
    }, 400);
  }, [data, navigate]);

  if (!data) return null;

  const { bookingId, bookingMongoId, movieTitle, seatNumbers, showTime, showDate, screenName, totalPrice } = data;

  const verifyUrl = `${window.location.origin}/verify/${bookingId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}&bgcolor=0a0a1a&color=ffffff`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-emerald-500/5"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-white text-center mb-1"
        >
          Booking Confirmed!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-400 text-center text-sm mb-8"
        >
          Grab your popcorn — you're all set!
        </motion.p>

        {/* E-Ticket Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]"
        >
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-indigo-500/10" />
            <div className="relative p-5 text-center">
              <div className="inline-flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium mb-1.5">
                <Ticket className="w-3 h-3" />
                E-Ticket
              </div>
              <h2 className="text-xl font-bold text-white">
                {movieTitle}
              </h2>
              {bookingId && (
                <p className="text-xs text-primary font-mono mt-2 bg-primary/10 inline-block px-3 py-1 rounded-full border border-primary/20 font-bold">
                  {bookingId}
                </p>
              )}
            </div>
          </div>

          {/* Tear line */}
          <div className="ticket-tear" />

          <div className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Show Time
                </p>
                <p className="font-semibold text-gray-200 mt-1 text-sm">{showTime}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1 justify-end">
                  <Armchair className="w-3 h-3" /> Tickets
                </p>
                <p className="font-semibold text-gray-200 mt-1 text-sm">{seatNumbers.length}</p>
              </div>
            </div>

            {(showDate || screenName) && (
              <div className="grid grid-cols-2 gap-4">
                {showDate && (
                  <div>
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date
                    </p>
                    <p className="font-semibold text-gray-200 mt-1 text-sm">
                      {new Date(showDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                )}
                {screenName && (
                  <div className={showDate ? "text-right" : ""}>
                    <p className={`text-[10px] text-gray-600 uppercase tracking-wider font-bold flex items-center gap-1 ${showDate ? "justify-end" : ""}`}>
                      <MapPin className="w-3 h-3" /> Screen
                    </p>
                    <p className="font-semibold text-gray-200 mt-1 text-sm">{screenName}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Seats</p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {seatNumbers.sort().map((seat) => (
                  <span key={seat} className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-mono font-bold border border-emerald-500/20">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            {totalPrice > 0 && (
              <div className="bg-white/[0.03] rounded-xl p-4 text-center border border-white/[0.04]">
                <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Amount Paid</p>
                <p className="text-2xl font-bold gradient-text-gold mt-1">₹{totalPrice.toLocaleString()}</p>
              </div>
            )}

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
        </motion.div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          {bookingMongoId && (
            <Link
              to={`/booking/${bookingMongoId}`}
              className="w-full text-center bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Full Ticket
            </Link>
          )}
          <Link
            to="/my-bookings"
            className="w-full text-center bg-white/5 hover:bg-white/10 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 border border-white/[0.06] flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            View All Bookings
          </Link>
          <Link
            to="/"
            className="text-center text-gray-500 hover:text-primary text-sm font-medium py-2 transition-colors flex items-center justify-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5" />
            Browse More Movies
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;