import React, { useEffect, useState, useCallback } from "react";
import { getAvailableSeats } from "../api/bookings";

interface SeatLayoutProps {
  movieId: string;
  showTime: string;
  onSeatSelect: (seats: string[]) => void;
  maxSelection?: number;
}

export const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
export const SEATS_PER_ROW = 12;

export const getSeatCategory = (
  row: string
): { label: string; price: number; color: string } => {
  if (["A", "B"].includes(row))
    return { label: "PREMIUM", price: 350, color: "text-amber-400" };
  if (["C", "D", "E"].includes(row))
    return { label: "EXECUTIVE", price: 250, color: "text-sky-400" };
  return { label: "CLASSIC", price: 150, color: "text-emerald-400" };
};

const SeatLayout: React.FC<SeatLayoutProps> = ({
  movieId,
  showTime,
  onSeatSelect,
  maxSelection = 10,
}) => {
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize callback to prevent infinite loops
  const stableOnSeatSelect = useCallback(onSeatSelect, []);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!movieId || !showTime) return;
      setLoading(true);
      try {
        const data = await getAvailableSeats(movieId, showTime);
        setAvailableSeats(data || []);
        setSelectedSeats([]);
        stableOnSeatSelect([]);
      } catch (err) {
        console.error("Error fetching seats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [movieId, showTime, stableOnSeatSelect]);

  const handleSeatClick = (seatId: string) => {
    if (!availableSeats.includes(seatId)) return;

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
      "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-t-lg text-[9px] sm:text-[10px] md:text-xs font-medium flex items-center justify-center transition-all duration-200 border-2 select-none";

    if (selectedSeats.includes(seatId)) {
      return `${base} bg-emerald-500 border-emerald-400 text-white scale-105 shadow-lg shadow-emerald-500/30 cursor-pointer`;
    }
    if (!availableSeats.includes(seatId)) {
      return `${base} bg-gray-700/60 border-gray-700/60 text-gray-600 cursor-not-allowed`;
    }
    return `${base} bg-transparent border-gray-500 text-gray-400 hover:border-emerald-400 hover:text-emerald-300 cursor-pointer`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#1a1a2e] rounded-xl">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  let lastCategory = "";

  return (
    <div className="bg-[#1a1a2e] rounded-xl p-4 sm:p-6 md:p-8 overflow-x-auto">
      {/* Screen indicator */}
      <div className="text-center mb-8 min-w-[480px]">
        <div className="w-3/4 mx-auto h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full opacity-80" />
        <div className="w-2/3 mx-auto h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent rounded-full mt-1" />
        <p className="text-gray-500 text-[10px] mt-2 tracking-[0.2em] uppercase font-medium">
          Screen this way
        </p>
      </div>

      {/* Seat grid */}
      <div className="space-y-1.5 min-w-[480px]">
        {ROWS.map((row) => {
          const category = getSeatCategory(row);
          const showLabel = category.label !== lastCategory;
          lastCategory = category.label;

          return (
            <React.Fragment key={row}>
              {/* Category separator */}
              {showLabel && (
                <div className="flex items-center gap-3 py-2 mt-3 first:mt-0">
                  <div className="flex-1 border-t border-gray-700/50" />
                  <span
                    className={`text-[10px] sm:text-xs font-semibold tracking-wider ${category.color}`}
                  >
                    {category.label} &mdash; ₹{category.price}
                  </span>
                  <div className="flex-1 border-t border-gray-700/50" />
                </div>
              )}

              {/* Row */}
              <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                <span className="w-5 text-right text-[10px] sm:text-xs text-gray-500 font-mono mr-1 sm:mr-2">
                  {row}
                </span>

                {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
                  const seatId = `${row}${i + 1}`;
                  const isAisle = i === 3 || i === 8;
                  return (
                    <React.Fragment key={seatId}>
                      <button
                        onClick={() => handleSeatClick(seatId)}
                        className={getSeatClasses(seatId)}
                        disabled={!availableSeats.includes(seatId)}
                        title={`${seatId} — ₹${category.price}`}
                      >
                        {i + 1}
                      </button>
                      {isAisle && <div className="w-3 sm:w-5" />}
                    </React.Fragment>
                  );
                })}

                <span className="w-5 text-left text-[10px] sm:text-xs text-gray-500 font-mono ml-1 sm:ml-2">
                  {row}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 pt-4 border-t border-gray-700/40 min-w-[480px]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-md border-2 border-gray-500" />
          <span className="text-xs text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-md bg-emerald-500 border-2 border-emerald-400" />
          <span className="text-xs text-gray-400">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-t-md bg-gray-700/60 border-2 border-gray-700/60" />
          <span className="text-xs text-gray-400">Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;