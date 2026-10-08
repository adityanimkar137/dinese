import axios from 'axios';

// Axios instance: every request starts with this base URL.
// So api.get('/restaurants') calls http://localhost:5000/api/restaurants
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Our backend sends errors as { success: false, message: "..." }. This pulls out the message.
export const getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return 'Cannot reach the server. Is the backend running?';
};

export default api;
