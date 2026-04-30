import axios from "axios";

const instance = axios.create({
  baseURL: "https://ranjay29.github.io/HeyBro/"
});

// This is where we globally attach the JWT to every request
instance.interceptors.request.use((config) => {
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