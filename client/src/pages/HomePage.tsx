import React, { useState, useEffect, useMemo } from "react";
import { getMovies, Movie } from "../api/movies";
import MovieCard from "../components/MovieCard";
import { motion } from "framer-motion";

const GENRES = ["All", "Action", "Drama", "Thriller", "Comedy", "Sci-Fi", "Romance", "Crime"];

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
      } catch (err) {
        console.error("Failed to load movies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = genre === "All" || m.genre?.toLowerCase() === genre.toLowerCase();
      return matchesSearch && matchesGenre;
    });
  }, [movies, search, genre]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 hero-gradient" />

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-float" />
        <div
          className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/8 rounded-full blur-[120px] animate-float"
          style={{ animationDelay: "3s" }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight">
              <span className="text-white">Discover &</span>{" "}
              <span className="gradient-text">Book Movies</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl mt-4 max-w-2xl mx-auto">
              Your next cinema experience is just a few clicks away.
              Browse, pick your seats, and enjoy the show.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search for movies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 backdrop-blur-xl transition-all text-sm sm:text-base"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Movies Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 -mt-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Now Showing</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
        </div>

        {/* Genre filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                genre === g
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-white/5 rounded-xl" />
                <div className="h-4 bg-white/5 rounded mt-3 w-3/4" />
                <div className="h-3 bg-white/5 rounded mt-2 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Movie Grid */}
        {!loading && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05 } },
            }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
          >
            {filtered.length > 0 ? (
              filtered.map((movie) => (
                <motion.div
                  key={movie._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="text-5xl mb-4 opacity-40">🎬</div>
                <h3 className="text-lg font-medium text-gray-400 mb-2">
                  No movies found
                </h3>
                <p className="text-gray-500 text-sm">
                  Try adjusting your search or filter
                </p>
              </div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
