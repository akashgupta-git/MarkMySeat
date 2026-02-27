import api from "../utils/axios";
import { SeatConfig } from "../types/User";

export interface Movie {
  _id: string;
  title: string;
  posterUrl?: string;
  genre?: string;
  description?: string;
  language?: string;
  duration?: string;
  rating?: string;
  cast?: string;
  showTimes: string[];
  theatre?: {
    _id: string;
    name: string;
    city?: string;
    address?: string;
    seatConfig?: SeatConfig;
  } | null;
  screen?: {
    _id: string;
    name: string;
    screenNumber: number;
    seatConfig?: SeatConfig;
  } | null;
}

export const getMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get("/movies/all");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Could not fetch movies.");
  }
};

export const getMovieById = async (movieId: string): Promise<Movie> => {
  try {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch movie ${movieId}:`, error);
    throw new Error("Could not fetch movie.");
  }
};