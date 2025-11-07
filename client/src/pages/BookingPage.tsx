import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById, Movie } from "../api/movies"; // ✅ Correct import
import SeatLayout from "../components/SeatLayout";
import { AuthContext } from "../context/AuthContext";

const BookingPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [showTime, setShowTime] = useState<string>(""); // ✅ Default to empty
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const selected = await getMovieById(movieId); // ✅ Fetch only one movie
        setMovie(selected || null);
        
        // ✅ Set default showtime from the movie's actual data
        if (selected && selected.showTimes && selected.showTimes.length > 0) {
          setShowTime(selected.showTimes[0]);
        }
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  const handleNext = () => {
    // ... (Your existing validation logic is fine)
  };

  if (loading || !movie) {
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
          {/* ✅ FIX: Render showtimes dynamically from movie data */}
          {movie.showTimes.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Only render SeatLayout if a showtime is selected */}
      {showTime && (
        <SeatLayout
          movieId={movie._id}
          showTime={showTime}
          onSeatSelect={(seats) => setSelectedSeats(seats)}
          maxSelection={8}
        />
      )}

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