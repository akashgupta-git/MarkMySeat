import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { getMovies } from "../api/auth";
import { useNavigate } from "react-router-dom";

interface Movie {
  _id: string;
  title: string;
  poster?: string;
  genre?: string;
  rating?: number;
}

const MovieCard: React.FC<{ movie: Movie; onClick: () => void }> = ({
  movie,
  onClick,
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
    className="cursor-pointer"
    onClick={onClick}
  >
    <div className="relative rounded-lg overflow-hidden shadow-xl">
      <motion.img
        src={movie.poster || "/fallback.jpg"}
        alt={movie.title}
        onError={(e) => (e.currentTarget.src = "/fallback.jpg")}
        className="w-full h-64 object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
        <div>
          <h3 className="text-white font-semibold text-lg">{movie.title}</h3>
          {movie.genre && (
            <span className="text-xs bg-white/10 text-gray-200 px-2 py-0.5 rounded mt-1 inline-block">
              {movie.genre}
            </span>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendStatus, setBackendStatus] = useState<string>("⏳ Checking backend...");
  const navigate = useNavigate();

  // ✅ Backend health check (logs only, no visual errors)
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const baseUrl =
          process.env.REACT_APP_API_URL || "http://localhost:8080/api";
        const res = await fetch(`${baseUrl}/health`);
        if (res.ok) {
          setBackendStatus("✅ Connected to backend");
          console.log("✅ Backend connection successful.");
        } else {
          setBackendStatus("❌ Backend unreachable");
          console.warn("⚠️ Backend reachable but returned non-OK response.");
        }
      } catch (error) {
        setBackendStatus("❌ Backend not responding");
        console.error("❌ Backend health check failed:", error);
      }
    };
    checkBackend();
  }, []);

  // ✅ Fetch movies (errors logged to console only)
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await getMovies();
        const movieList = Array.isArray(response)
          ? response
          : response.movies || [];
        setMovies(movieList);
      } catch (error) {
        console.error("❌ Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // ✅ Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-b from-gray-100 to-white min-h-screen"
    >
      {/* Header */}
      <motion.header
        className="max-w-6xl mx-auto px-6 py-10"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight text-center">
          🎬 Welcome to MarkMySeat
        </h1>
        <p className="text-center text-sm text-gray-500 mt-2">{backendStatus}</p>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="max-w-6xl mx-auto px-6 mb-10"
      >
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl shadow-xl p-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Now Showing</h2>
          <p className="text-sm text-indigo-100/90">
            Book your favorite movie seats with ease & pay securely 💳
          </p>
        </div>
      </motion.section>

      {/* Movie Section */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-gray-600 text-lg">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mr-3"></div>
            Loading movies...
          </div>
        ) : movies.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 mt-20 text-lg"
          >
            🎥 No movies available right now.
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Slider {...settings}>
              {movies.map((movie, i) => (
                <motion.div
                  key={movie._id}
                  className="px-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <MovieCard
                    movie={movie}
                    onClick={() => navigate(`/book/${movie._id}`)}
                  />
                </motion.div>
              ))}
            </Slider>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default HomePage;
