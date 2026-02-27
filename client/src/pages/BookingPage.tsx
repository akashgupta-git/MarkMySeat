import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById, Movie } from "../api/movies";
import SeatLayout, { getSeatCategory } from "../components/SeatLayout";
import { motion } from "framer-motion";

const SHOW_TIMES = ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"];

const BookingPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState(SHOW_TIMES[0]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) return;
      try {
        const data = await getMovieById(movieId);
        setMovie(data);
      } catch (err) {
        console.error("Failed to load movie:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  const totalPrice = selectedSeats.reduce((sum, seat) => {
    return sum + getSeatCategory(seat.charAt(0)).price;
  }, 0);

  const handleBookNow = () => {
    if (!movie || selectedSeats.length === 0) return;
    navigate("/confirm-booking", {
      state: {
        movieId: movie._id,
        movieTitle: movie.title,
        posterUrl: movie.posterUrl,
        seatNumbers: selectedSeats,
        showTime: selectedTime,
        totalPrice,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-400">
        <p className="text-lg mb-4">Movie not found.</p>
        <button
          onClick={() => navigate("/")}
          className="text-primary font-medium hover:underline"
        >
          Go back home
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-28"
    >
      {/* Movie Header with blurred poster bg */}
      <div className="relative overflow-hidden">
        {movie.posterUrl && (
          <div className="absolute inset-0">
            <img
              src={movie.posterUrl}
              alt=""
              className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
            />
            <div className="absolute inset-0 bg-dark/80" />
          </div>
        )}

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex gap-5 sm:gap-8">
            {/* Poster */}
            {movie.posterUrl && (
              <div className="flex-shrink-0">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-28 sm:w-36 md:w-44 rounded-xl shadow-2xl shadow-black/50"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}

            {/* Details */}
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {movie.genre && (
                  <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full border border-white/5">
                    {movie.genre}
                  </span>
                )}
                {movie.language && (
                  <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full border border-white/5">
                    {movie.language}
                  </span>
                )}
                {movie.duration && (
                  <span className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full border border-white/5">
                    {movie.duration}
                  </span>
                )}
              </div>
              {movie.description && (
                <p className="text-gray-400 text-sm mt-3 line-clamp-3 hidden sm:block">
                  {movie.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Showtime + Seat Selection */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
        {/* Show Times */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Select Showtime
          </h3>
          <div className="flex flex-wrap gap-2">
            {SHOW_TIMES.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setSelectedTime(time);
                  setSelectedSeats([]);
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedTime === time
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Seat Layout */}
        <SeatLayout
          movieId={movie._id}
          showTime={selectedTime}
          onSeatSelect={setSelectedSeats}
        />
      </div>

      {/* Sticky bottom bar */}
      {selectedSeats.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 bg-dark-light/90 backdrop-blur-xl border-t border-white/5 z-40"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                {selectedSeats.length} seat{selectedSeats.length > 1 ? "s" : ""} selected
              </p>
              <p className="text-xl font-bold text-white">
                ₹{totalPrice.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleBookNow}
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary/25 text-sm sm:text-base"
            >
              Book Now
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BookingPage;
