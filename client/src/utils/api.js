import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config);
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
      console.log(`📥 API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

export default api;
