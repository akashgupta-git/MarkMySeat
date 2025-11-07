import api from "../utils/axios";

// This interface matches your new backend model
export interface Movie {
  _id: string;
  title: string;
  posterUrl?: string;
  genre?: string;
  description?: string;
  duration?: string;
  showTimes: string[];
}

/**
 * Fetches all movies from GET /api/movies/all
 */
export const getMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get("/movies/all");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Could not fetch movies.");
  }
};

/**
 * Fetches a single movie by its ID from GET /api/movies/:id
 */
export const getMovieById = async (movieId: string): Promise<Movie> => {
  try {
    const response = await api.get(`/movies/${movieId}`); 
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch movie ${movieId}:`, error);
    throw new Error("Could not fetch movie.");
  }
};