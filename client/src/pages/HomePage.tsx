import React, { useState, useEffect, useMemo } from "react";
import { getMovies, Movie } from "../api/movies";
import MovieCard from "../components/MovieCard";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, TrendingUp, SlidersHorizontal } from "lucide-react";

const GENRES = ["All", "Action", "Drama", "Thriller", "Comedy", "Sci-Fi", "Romance", "Crime"];

const GENRE_ICONS: Record<string, string> = {
  All: "🎬", Action: "💥", Drama: "🎭", Thriller: "🔪", Comedy: "😂",
  "Sci-Fi": "🚀", Romance: "💕", Crime: "🕵️",
};

// Floating particles for hero
function Particles() {
  return (
    <div className="particles">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            bottom: `-${Math.random() * 10}%`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 8}s`,
            background: i % 3 === 0
              ? "rgba(220, 53, 79, 0.4)"
              : i % 3 === 1
              ? "rgba(99, 102, 241, 0.3)"
              : "rgba(6, 182, 212, 0.3)",
          }}
        />
      ))}
    </div>
  );
}

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

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
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 hero-gradient" />
        <Particles />

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/8 rounded-full blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-gray-300">
                {movies.length > 0 ? `${movies.length} movies now showing` : "Discover movies"}
              </span>
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-white">Your Film,</span>{" "}
              <span className="gradient-text">Your Seat</span>
              <span className="text-white">.</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl mt-5 max-w-2xl mx-auto leading-relaxed">
              Premium cinema booking with real-time seat selection.
              <span className="text-gray-300 font-medium"> Zero conflicts, instant confirmation.</span>
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 max-w-xl mx-auto"
          >
            <div className={`relative transition-all duration-500 ${searchFocused ? "scale-[1.02]" : ""}`}>
              <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${searchFocused ? "bg-primary/10 blur-xl" : ""}`} />
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${searchFocused ? "text-primary" : "text-gray-500"}`} />
                <input
                  type="text"
                  placeholder="Search movies, genres, languages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full pl-12 pr-12 py-4 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 backdrop-blur-xl transition-all text-sm sm:text-base"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Movies Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 -mt-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Now Showing</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          {!loading && filtered.length > 0 && (
            <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
              {filtered.length} {filtered.length === 1 ? "movie" : "movies"}
            </span>
          )}
        </div>

        {/* Genre filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                genre === g
                  ? "bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              <span className="text-xs">{GENRE_ICONS[g]}</span>
              {g}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-white/5 rounded-xl shimmer-line" />
                <div className="h-4 bg-white/5 rounded mt-3 w-3/4" />
                <div className="h-3 bg-white/5 rounded mt-2 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Movie Grid */}
        {!loading && (
          <AnimatePresence mode="wait">
            <motion.div
              key={genre + search}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
              }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
            >
              {filtered.length > 0 ? (
                filtered.map((movie) => (
                  <motion.div
                    key={movie._id}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.95 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
                    }}
                  >
                    <MovieCard movie={movie} />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-24"
                >
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    No movies found
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Try adjusting your search or filter
                  </p>
                  {(search || genre !== "All") && (
                    <button
                      onClick={() => { setSearch(""); setGenre("All"); }}
                      className="mt-4 text-primary text-sm font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </div>
  );
};

export default HomePage;