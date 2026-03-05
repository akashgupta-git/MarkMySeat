import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Play, MapPin } from "lucide-react";

interface MovieCardProps {
  movie: {
    _id: string;
    title: string;
    posterUrl?: string;
    genre?: string;
    language?: string;
    duration?: string;
    rating?: number | string;
    theatre?: {
      name?: string;
      city?: string;
    } | null;
  };
}

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450'%3E%3Crect width='300' height='450' fill='%23161630'/%3E%3Ctext x='150' y='220' text-anchor='middle' fill='%234a4a6a' font-family='system-ui' font-size='14'%3ENo Poster%3C/text%3E%3C/svg%3E";

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="cursor-pointer group"
      onClick={() => navigate(`/book/${movie._id}`)}
    >
      <div className="relative overflow-hidden rounded-xl card-glow">
        <div className="aspect-[2/3] overflow-hidden bg-dark-card rounded-xl">
          {/* Skeleton while loading */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-white/5 animate-pulse" />
          )}
          <img
            src={movie.posterUrl || FALLBACK}
            alt={movie.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => { e.currentTarget.src = FALLBACK; setImageLoaded(true); }}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>

        {/* Persistent bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
        </div>

        {/* Hover overlay with CTA */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/30 backdrop-blur-[2px]">
          <motion.span
            initial={false}
            whileHover={{ scale: 1.05 }}
            className="bg-primary text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-xl shadow-primary/40 transform scale-90 group-hover:scale-100 transition-transform duration-300 flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-white" />
            Book Now
          </motion.span>
        </div>

        {/* Genre + language tag */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {movie.genre && (
            <span className="text-[10px] bg-black/60 backdrop-blur-md text-white/90 px-2 py-0.5 rounded-md font-medium border border-white/10">
              {movie.genre}
            </span>
          )}
        </div>

        {/* Duration tag */}
        {movie.duration && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] bg-black/60 backdrop-blur-md text-white/80 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 border border-white/10">
              <Clock className="w-2.5 h-2.5" />
              {movie.duration}
            </span>
          </div>
        )}

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-semibold text-white text-sm leading-tight truncate drop-shadow-lg group-hover:text-primary-light transition-colors duration-300">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-300">
            {movie.language && <span className="bg-white/10 px-1.5 py-0.5 rounded">{movie.language}</span>}
          </div>
          {/* Theatre / city info (when available) */}
          {movie.theatre?.name && (
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400 truncate">
              <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">
                {movie.theatre.name}
                {movie.theatre.city ? ` · ${movie.theatre.city}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;