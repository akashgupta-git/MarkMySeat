import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMovies } from "../api/auth";

interface Movie {
  _id: string;
  title: string;
}

const CreateBooking: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await getMovies();
        setMovies(res.movies); // assuming backend returns { movies: [...] }
      } catch (error) {
        console.error("Error fetching movies", error);
      }
    };

    fetchMovies();
  }, []);

  const handleSelect = (movieId: string) => {
    navigate(`/book/${movieId}`);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-6">Choose a Movie</h1>
      <div className="grid gap-4 max-w-xl mx-auto">
        {movies.map((movie) => (
          <div
            key={movie._id}
            onClick={() => handleSelect(movie._id)}
            className="bg-white p-4 rounded shadow hover:bg-blue-100 cursor-pointer"
          >
            <h2 className="text-xl font-semibold">{movie.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateBooking;
