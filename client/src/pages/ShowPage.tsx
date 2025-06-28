import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovies } from "../api/auth";

interface Movie {
  _id: string;
  title: string;
  description?: string;
  posterUrl?: string;
}

const ShowPage: React.FC = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const { movieId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await getMovies();
        const movieDetails = response.movies.find((m: Movie) => m._id === movieId);
        setMovie(movieDetails);
      } catch (error) {
        console.error("Error fetching movie", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [movieId]);

  const handleBook = () => {
    if (!movieId) return;
    navigate(`/book/${movieId}`);
  };

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  if (!movie) return <p className="p-6 text-center">Movie not found</p>;

  return (
    <div className="p-6 min-h-screen bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
      {movie.posterUrl && (
        <img src={movie.posterUrl} alt={movie.title} className="w-64 mb-4 rounded shadow" />
      )}
      <p className="mb-4 max-w-lg text-center">{movie.description || "No description available."}</p>
      <button
        onClick={handleBook}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Book Now
      </button>
    </div>
  );
};

export default ShowPage;
