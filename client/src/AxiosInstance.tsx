import axios from "axios";


let API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance with initial URL
const AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});


AxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("Axios is sending this token:", token);

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers["Content-Type"] = "multipart/form-data";
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

AxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status != 422) {
      console.error("Unexpected response error: ", error);
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;