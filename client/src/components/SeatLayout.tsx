import React, { useEffect, useState, useCallback } from "react";
import { getAvailableSeats } from "../api/bookings"; // ✅ Correct import

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

  // Use useCallback to prevent unnecessary re-renders
  const stableOnSeatSelect = useCallback(onSeatSelect, [onSeatSelect]);

  useEffect(() => {
    const fetchSeats = async () => {
      // Don't fetch if movie or showtime aren't set
      if (!movieId || !showTime) return; 
      
      try {
        const data = await getAvailableSeats(movieId, showTime);
        setAvailableSeats(data || []);
        setSelectedSeats([]);
        stableOnSeatSelect([]); // Use stable function
      } catch (err) {
        console.error("Error fetching available seats:", err);
      }
    };
    fetchSeats();
  }, [movieId, showTime, stableOnSeatSelect]); // ✅ Dependency array is correct

  // ... (Your handleSeatClick and getSeatStyle functions are fine)
  
  // ... (The rest of your JSX is fine)
};

export default SeatLayout;