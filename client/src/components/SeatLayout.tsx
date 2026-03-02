import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getAvailableSeats } from "../api/bookings";
import { SeatConfig, SeatCategory } from "../types/User";
import { motion } from "framer-motion";

interface SeatLayoutProps {
  movieId: string;
  showTime: string;
  showDate?: string;
  onSeatSelect: (seats: string[]) => void;
  maxSelection?: number;
  seatConfig?: SeatConfig | null;
}

// Default config when no screen config is provided (legacy movies / system movies)
const DEFAULT_ROWS = 8;
const DEFAULT_SEATS_PER_ROW = 12;
const DEFAULT_CATEGORIES: SeatCategory[] = [
  { name: "Premium", rows: ["A", "B"], price: 350, color: "#eab308" },
  { name: "Executive", rows: ["C", "D", "E"], price: 250, color: "#0ea5e9" },
  { name: "Classic", rows: ["F", "G", "H"], price: 150, color: "#22c55e" },
];

// map category colors to tailwind text classes
const colorToTailwind: Record<string, string> = {
  "#eab308": "text-amber-400",
  "#0ea5e9": "text-sky-400",
  "#22c55e": "text-emerald-400",
  "#8b5cf6": "text-violet-400",
  "#ef4444": "text-red-400",
  "#f97316": "text-orange-400",
  "#ec4899": "text-pink-400",
  "#06b6d4": "text-cyan-400",
};
const colorToBg: Record<string, string> = {
  "#eab308": "bg-amber-400/10",
  "#0ea5e9": "bg-sky-400/10",
  "#22c55e": "bg-emerald-400/10",
  "#8b5cf6": "bg-violet-400/10",
  "#ef4444": "bg-red-400/10",
  "#f97316": "bg-orange-400/10",
  "#ec4899": "bg-pink-400/10",
  "#06b6d4": "bg-cyan-400/10",
};
function getCatColor(hex: string): string {
  return colorToTailwind[hex?.toLowerCase()] || "text-gray-300";
}
function getCatBg(hex: string): string {
  return colorToBg[hex?.toLowerCase()] || "bg-gray-300/10";
}

/** Exported helper so other components can compute price for a given seat row */
export function getSeatCategory(
  row: string,
  categories?: SeatCategory[],
): { label: string; price: number; color: string } {
  const cats = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;
  for (const cat of cats) {
    if (cat.rows.includes(row)) {
      return { label: cat.name.toUpperCase(), price: cat.price, color: getCatColor(cat.color) };
    }
  }
  const last = cats[cats.length - 1];
  return { label: last.name.toUpperCase(), price: last.price, color: getCatColor(last.color) };
}

const SeatLayout: React.FC<SeatLayoutProps> = ({
  movieId,
  showTime,
  showDate,
  onSeatSelect,
  maxSelection = 10,
  seatConfig,
}) => {
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [lockedSeats, setLockedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const stableOnSeatSelect = useCallback(onSeatSelect, []);

  const totalRows = seatConfig?.rows || DEFAULT_ROWS;
  const seatsPerRow = seatConfig?.seatsPerRow || DEFAULT_SEATS_PER_ROW;
  const categories = seatConfig?.categories && seatConfig.categories.length > 0
    ? seatConfig.categories
    : DEFAULT_CATEGORIES;

  const rowLetters = useMemo(
    () => Array.from({ length: totalRows }, (_, i) => String.fromCharCode(65 + i)),
    [totalRows],
  );

  // compute aisle positions (roughly at 1/3 and 2/3)
  const aisles = useMemo(() => {
    if (seatsPerRow <= 6) return [];
    const a1 = Math.floor(seatsPerRow / 3);
    const a2 = Math.floor((seatsPerRow * 2) / 3);
    return [a1, a2];
  }, [seatsPerRow]);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!movieId || !showTime) return;
      setLoading(true);
      try {
        const data = await getAvailableSeats(movieId, showTime, showDate);
        setAvailableSeats(data.availableSeats || []);
        setLockedSeats(data.lockedSeats || []);
        setSelectedSeats([]);
        stableOnSeatSelect([]);
      } catch (err) {
        console.error("Error fetching seats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [movieId, showTime, showDate, stableOnSeatSelect]);

  const handleSeatClick = (seatId: string) => {
    if (!availableSeats.includes(seatId) || lockedSeats.includes(seatId)) return;

    let newSelected: string[];
    if (selectedSeats.includes(seatId)) {
      newSelected = selectedSeats.filter((s) => s !== seatId);
    } else {
      if (selectedSeats.length >= maxSelection) return;
      newSelected = [...selectedSeats, seatId];
    }
    setSelectedSeats(newSelected);
    stableOnSeatSelect(newSelected);
  };

  const getSeatClasses = (seatId: string): string => {
    const base =
      "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-t-lg text-[9px] sm:text-[10px] md:text-xs font-semibold flex items-center justify-center transition-all duration-200 border-2 select-none";

    if (selectedSeats.includes(seatId)) {
      return `${base} bg-emerald-500 border-emerald-400 text-white scale-110 shadow-lg shadow-emerald-500/40 cursor-pointer ring-2 ring-emerald-400/20`;
    }
    if (lockedSeats.includes(seatId)) {
      return `${base} bg-amber-600/30 border-amber-500/40 text-amber-400/50 cursor-not-allowed animate-pulse`;
    }
    if (!availableSeats.includes(seatId)) {
      return `${base} bg-gray-800/50 border-gray-700/40 text-gray-700 cursor-not-allowed`;
    }
    return `${base} bg-white/[0.03] border-gray-600/50 text-gray-400 hover:border-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:scale-105 cursor-pointer`;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-[#12122a] rounded-2xl border border-white/[0.04]">
        <div className="animate-spin h-9 w-9 border-[3px] border-primary border-t-transparent rounded-full" />
        <p className="text-gray-600 text-xs mt-4">Loading seat map...</p>
      </div>
    );
  }

  let lastCategory = "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-[#12122a] rounded-2xl p-4 sm:p-6 md:p-8 overflow-x-auto border border-white/[0.04] relative"
    >
      {/* Subtle ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-cyan-500/[0.04] blur-3xl rounded-full pointer-events-none" />

      {/* Screen indicator — immersive curved screen */}
      <div className="text-center mb-10 min-w-[480px] relative">
        <div className="screen-curve mx-auto" />
        <p className="text-gray-600 text-[10px] mt-3 tracking-[0.25em] uppercase font-medium">
          All eyes this way
        </p>
      </div>

      {/* Seat grid with perspective */}
      <div
        className="space-y-1.5 min-w-[480px]"
        style={{ perspective: "800px" }}
      >
        {rowLetters.map((row, rowIdx) => {
          const category = getSeatCategory(row, categories);
          const rawCat = (seatConfig?.categories && seatConfig.categories.length > 0 ? seatConfig.categories : DEFAULT_CATEGORIES).find(c => c.rows.includes(row));
          const catBg = rawCat ? getCatBg(rawCat.color) : "bg-gray-300/10";
          const showLabel = category.label !== lastCategory;
          lastCategory = category.label;

          // slight 3d tilt for depth — close rows tilt more
          const tiltDeg = Math.max(0, (rowLetters.length - rowIdx - 1) * 0.6);

          return (
            <React.Fragment key={row}>
              {/* Category separator */}
              {showLabel && (
                <div className="flex items-center gap-3 py-2.5 mt-4 first:mt-0">
                  <div className="flex-1 border-t border-gray-700/30" />
                  <span
                    className={`text-[10px] sm:text-xs font-bold tracking-widest ${category.color} ${catBg} px-4 py-1 rounded-full`}
                  >
                    {category.label} — ₹{category.price}
                  </span>
                  <div className="flex-1 border-t border-gray-700/30" />
                </div>
              )}

              {/* Row */}
              <div
                className="flex items-center justify-center gap-1 sm:gap-1.5"
                style={{ transform: `rotateX(${tiltDeg}deg)`, transformOrigin: "center bottom" }}
              >
                <span className="w-5 text-right text-[10px] sm:text-xs text-gray-600 font-mono mr-1 sm:mr-2 font-bold">
                  {row}
                </span>

                {Array.from({ length: seatsPerRow }, (_, i) => {
                  const seatId = `${row}${i + 1}`;
                  const isAisle = aisles.includes(i + 1);
                  return (
                    <React.Fragment key={seatId}>
                      <button
                        onClick={() => handleSeatClick(seatId)}
                        className={getSeatClasses(seatId)}
                        disabled={!availableSeats.includes(seatId) || lockedSeats.includes(seatId)}
                        title={lockedSeats.includes(seatId) ? `${seatId} — Held by another user` : `${seatId} — ₹${category.price}`}
                      >
                        {i + 1}
                      </button>
                      {isAisle && <div className="w-3 sm:w-5" />}
                    </React.Fragment>
                  );
                })}

                <span className="w-5 text-left text-[10px] sm:text-xs text-gray-600 font-mono ml-1 sm:ml-2 font-bold">
                  {row}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-5 sm:gap-7 mt-10 pt-5 border-t border-gray-700/20 min-w-[480px]">
        {[
          { cls: "border-2 border-gray-600/50 bg-white/[0.03]", label: "Available" },
          { cls: "bg-emerald-500 border-2 border-emerald-400 shadow-sm shadow-emerald-500/30", label: "Selected" },
          { cls: "bg-amber-600/30 border-2 border-amber-500/40", label: "Held" },
          { cls: "bg-gray-800/50 border-2 border-gray-700/40", label: "Booked" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-t-md ${item.cls}`} />
            <span className="text-xs text-gray-500 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SeatLayout;