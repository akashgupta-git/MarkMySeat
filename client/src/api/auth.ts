import axios from 'axios';

const API = axios.create({
  baseURL: 'http://51.21.27.2:8080/api', // ✅ Updated Elastic IP
  withCredentials: true,
});


// Add auth token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Seat Booking API
export const getAvailableSeats = async (movieId: string, showTime: string) => {
  try {
    const response = await API.get('/bookings/available-seats', {
      params: { movieId, showTime }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching available seats:', error);
    throw error;
  }
};

export const createBooking = async (movieId: string, seatNumber: string, showTime: string) => {
  try {
    const response = await API.post('/bookings/create', {
      movieId,
      seatNumber,
      showTime
    });
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Movie API
export const getMovies = async () => {
  try {
    const response = await API.get('/movies/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
};

// Auth API
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    const response = await API.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await API.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    const response = await API.get('/auth/verify');
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return null;
  }
};