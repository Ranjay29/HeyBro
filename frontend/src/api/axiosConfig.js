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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;