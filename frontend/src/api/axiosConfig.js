import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://heybro-backend.onrender.com/api";

const instance = axios.create({
  baseURL: BASE_URL
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData, ensure browser handles Content-Type with boundary
    // but keep other headers like Authorization
    if (config.data instanceof FormData) {
      // Don't set Content-Type for FormData - browser will add boundary
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
      if (config.headers?.common) {
        delete config.headers.common['Content-Type'];
      }
      if (config.headers?.post) {
        delete config.headers.post['Content-Type'];
      }
    }
    
    console.log("Request headers:", config.headers);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
    }
    return Promise.reject(error);
  }
);

export default instance;