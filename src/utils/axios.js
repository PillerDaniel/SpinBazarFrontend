// In a file like api.js or utils/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true
});

// Add a request interceptor to include the token in all requests
axiosInstance.interceptors.request.use(
    (config) => {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // If token exists, add it to the Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`Adding token to request: ${config.url}`);
      } else {
        console.log(`No token available for request: ${config.url}`);
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        console.log('Authentication error - you may need to log in again');
        // Optional: Trigger logout or redirect to login page
        // window.dispatchEvent(new Event('logout'));
      }
      
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return Promise.reject(error);
    }
  );

export default axiosInstance;