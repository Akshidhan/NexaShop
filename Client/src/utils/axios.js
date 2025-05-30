import axios from 'axios';


const baseURL = import.meta.env.VITE_BASE_URL || 'https://nexashop-clmi.onrender.com/';

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/auth/refresh`, { withCredentials: true });
        const newToken = refreshResponse.data.accessToken;
        
        localStorage.setItem('token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        window.store.dispatch(logout());
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.data?.message) {
      console.error('API Error:', error.response.data.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;