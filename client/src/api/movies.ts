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

// pull all active movies, optionally narrowed down to a particular city
export const getMovies = async (city?: string): Promise<Movie[]> => {
  try {
    const params: Record<string, string> = {};
    if (city) params.city = city;
    const response = await api.get("/movies/all", { params });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Could not fetch movies.");
  }
};

// grab the list of cities where movies are actually playing right now
export const getCities = async (): Promise<string[]> => {
  try {
    const response = await api.get("/movies/cities");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
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