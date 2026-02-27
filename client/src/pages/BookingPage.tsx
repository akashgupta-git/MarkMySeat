import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById, Movie } from "../api/movies";
import SeatLayout, { getSeatCategory } from "../components/SeatLayout";
import { motion } from "framer-motion";

const DEFAULT_SHOW_TIMES = ["10:00 AM", "1:30 PM", "5:00 PM", "9:00 PM"];

/** Produce next 7 dates starting today */
function upcomingDates(count = 7): { label: string; value: string }[] {
  const dates: { label: string; value: string }[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const iso = d.toISOString().slice(0, 10); // YYYY-MM-DD
    const label =
      i === 0
        ? "Today"
        : i === 1
        ? "Tomorrow"
        : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    dates.push({ label, value: iso });
  }
  return dates;
}

const BookingPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const dates = useMemo(() => upcomingDates(7), []);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) return;
      try {
        const data = await getMovieById(movieId);
        setMovie(data);
        // auto-select first show time
        const times = data.showTimes?.length ? data.showTimes : DEFAULT_SHOW_TIMES;
        setSelectedTime(times[0]);
      } catch (err) {
        console.error("Failed to load movie:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  const showTimes = movie?.showTimes?.length ? movie.showTimes : DEFAULT_SHOW_TIMES;
  const seatConfig = movie?.screen?.seatConfig || movie?.theatre?.seatConfig || undefined;
  const categories = seatConfig?.categories;

  const totalPrice = selectedSeats.reduce((sum, seat) => {
    return sum + getSeatCategory(seat.charAt(0), categories).price;
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
        showDate: selectedDate,
        totalPrice,
        theatreId: movie.theatre?._id,
        screenName: movie.screen?.name || "",
        seatConfig: seatConfig || null,
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
        {/* Screen info */}
        {movie.screen && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/20">
              {movie.screen.name || `Screen ${movie.screen.screenNumber}`}
            </span>
            {movie.theatre?.name && (
              <span className="text-xs text-gray-500">{movie.theatre.name}</span>
            )}
          </div>
        )}

        {/* Date Picker */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Select Date
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {dates.map((d) => (
              <button
                key={d.value}
                onClick={() => {
                  setSelectedDate(d.value);
                  setSelectedSeats([]);
                }}
                className={`flex flex-col items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedDate === d.value
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                <span className="text-xs">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Show Times */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Select Showtime
          </h3>
          <div className="flex flex-wrap gap-2">
            {showTimes.map((time) => (
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
          showDate={selectedDate}
          onSeatSelect={setSelectedSeats}
          seatConfig={seatConfig}
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
