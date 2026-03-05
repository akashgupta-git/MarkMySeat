import { SeatMap } from "./SeatMap";
import { Movie } from "./Movie";

export interface Show {
  _id: string;
  movie: Movie;
  date: string;
  time: string;
  seatMap: SeatMap;
}
