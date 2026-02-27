import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface MovieCardProps {
  movie: {
    _id: string;
    title: string;
    posterUrl?: string;
    genre?: string;
    language?: string;
    duration?: string;
  };
}

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23161630'/%3E%3Ctext x='150' y='220' text-anchor='middle' fill='%234a4a6a' font-family='system-ui' font-size='14'%3ENo Poster%3C/text%3E%3C/svg%3E";

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="cursor-pointer group"
      onClick={() => navigate(`/book/${movie._id}`)}
    >
      <div className="relative overflow-hidden rounded-xl card-glow">
        <div className="aspect-[2/3] overflow-hidden bg-dark-card rounded-xl">
          <img
            src={movie.posterUrl || FALLBACK}
            alt={movie.title}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = FALLBACK; }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>

        {/* Persistent bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Hover overlay with CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30">
          <span className="bg-primary text-white text-xs font-semibold px-5 py-2 rounded-full shadow-lg shadow-primary/30 transform scale-90 group-hover:scale-100 transition-transform duration-300">
            Book Now
          </span>
        </div>

        {/* Genre tag */}
        {movie.genre && (
          <div className="absolute top-2.5 left-2.5">
            <span className="text-[10px] bg-black/50 backdrop-blur-md text-white/90 px-2 py-0.5 rounded-md font-medium">
              {movie.genre}
            </span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-semibold text-white text-sm leading-tight truncate drop-shadow-lg">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-300">
            {movie.language && <span>{movie.language}</span>}
            {movie.language && movie.duration && <span className="text-gray-500">&bull;</span>}
            {movie.duration && <span>{movie.duration}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
