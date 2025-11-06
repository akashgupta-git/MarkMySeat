import React, { useEffect, useState } from "react";
import { getAvailableSeats } from "../api/auth";

interface SeatLayoutProps {
  movieId: string;
  showTime: string;
  onSeatSelect: (seats: string[]) => void;
  maxSelection?: number;
}

const SeatLayout: React.FC<SeatLayoutProps> = ({
  movieId,
  showTime,
  onSeatSelect,
  maxSelection = 8,
}) => {
  const [availableSeats, setAvailableSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const allSeats = Array.from({ length: 30 }, (_, i) => `S${i + 1}`);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const data = await getAvailableSeats(movieId, showTime);
        setAvailableSeats(data.availableSeats || []);
        setSelectedSeats([]);
        onSeatSelect([]); // triggers ESLint warning if not in deps
      } catch (err) {
        console.error("Error fetching available seats:", err);
      }
    };
    fetchSeats();
    // Added onSeatSelect to dependency array
  }, [movieId, showTime, onSeatSelect]);

  const handleSeatClick = (seat: string) => {
    if (!availableSeats.includes(seat)) return;

    let updatedSeats = [...selectedSeats];
    if (selectedSeats.includes(seat)) {
      updatedSeats = updatedSeats.filter((s) => s !== seat);
    } else if (selectedSeats.length < maxSelection) {
      updatedSeats.push(seat);
    } else {
      alert(`❗ You can select a maximum of ${maxSelection} seats.`);
      return;
    }

    setSelectedSeats(updatedSeats);
    onSeatSelect(updatedSeats);
  };

  const getSeatStyle = (seat: string) => {
    if (!availableSeats.includes(seat))
      return "bg-red-500 text-white cursor-not-allowed";
    if (selectedSeats.includes(seat)) return "bg-green-600 text-white";
    return "bg-gray-300 text-black hover:bg-blue-200";
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="grid grid-cols-6 gap-4">
        {allSeats.map((seat) => (
          <button
            key={seat}
            onClick={() => handleSeatClick(seat)}
            disabled={!availableSeats.includes(seat)}
            className={`w-12 h-12 rounded ${getSeatStyle(seat)} transition duration-200`}
          >
            {seat}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-300 border" /> Available
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-green-600 border" /> Selected
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-red-500 border" /> Booked
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
