import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovies } from "../api/auth";
import SeatLayout from "../components/SeatLayout";
import { AuthContext } from "../context/AuthContext";

interface Movie {
  _id: string;
  title: string;
  posterUrl: string;
  description?: string;
  genre?: string;
}

const BookingPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showTime, setShowTime] = useState("10:00 AM");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const movies = await getMovies();
        const selected = movies.find((m: Movie) => m._id === movieId);
        setMovie(selected || null);
      } catch (error) {
        console.error("Error fetching movie:", error);
      }
    };
    if (movieId) fetchMovie();
  }, [movieId]);

  const handleNext = () => {
    if (!selectedSeats.length) {
      alert("❗ Please select at least one seat.");
      return;
    }

    if (!movie) {
      alert("❗ Movie not loaded. Try again.");
      return;
    }

    if (!user) {
      alert("❗ You must be logged in.");
      return;
    }

    navigate("/confirm-booking", {
      state: {
        movieId: movie._id,
        movieTitle: movie.title,
        seatNumbers: selectedSeats,
        showTime,
      },
    });
  };

  if (!movieId || !movie) {
    return (
      <div className="text-center mt-10 text-xl">
        🎬 Loading movie details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">
        Select Your Seat for <span className="text-indigo-600">{movie.title}</span>
      </h1>

      <div className="mb-6">
        <label className="block mb-2 font-medium">Choose Show Time:</label>
        <select
          value={showTime}
          onChange={(e) => setShowTime(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="10:00 AM">10:00 AM</option>
          <option value="2:00 PM">2:00 PM</option>
          <option value="6:00 PM">6:00 PM</option>
        </select>
      </div>

      <SeatLayout
        movieId={movie._id}
        showTime={showTime}
        onSeatSelect={(seats) => setSelectedSeats(seats)}
        maxSelection={8}
      />

      <div className="mt-6 text-center">
        <p className="mb-2 text-lg">
          🎟️ Selected Seat(s):{" "}
          <strong>{selectedSeats.length ? selectedSeats.join(", ") : "None"}</strong>
        </p>
        <button
          onClick={handleNext}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Continue to Confirm
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
