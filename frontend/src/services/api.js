import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Important for HttpOnly cookies
});

// Request interceptor to attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh') {
      originalRequest._retry = true;

      try {
        const res = await axios.post('http://localhost:5000/api/auth/refresh', {}, { withCredentials: true });
        
        if (res.data?.data?.token) {
          const newToken = res.data.data.token;
          localStorage.setItem('token', newToken);
          
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            user.token = newToken;
            localStorage.setItem('user', JSON.stringify(user));
          }
          
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, force logout
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Network error. Check your connection.');
    }
    
    return Promise.reject(error);
  }
);

export default api;
