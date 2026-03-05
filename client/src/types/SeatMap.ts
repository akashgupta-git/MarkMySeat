export interface Seat {
  seatNumber: string;
  isBooked: boolean;
}

export interface SeatMap {
  _id: string;
  seats: Seat[][];
}
