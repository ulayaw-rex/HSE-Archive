import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Create axios instance with initial URL
const AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  // We will handle XSRF manually in the interceptor below
  // xsrfCookieName: "XSRF-TOKEN",
  // xsrfHeaderName: "X-XSRF-TOKEN",
});

AxiosInstance.interceptors.request.use((config) => {
  // --- THE FIX: Manually read and decode the token ---
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (token) {
    // Laravel requires the token to be decoded
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }
  // --------------------------------------------------

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
    if (error.response && error.response.status !== 422) {
      console.error("Unexpected response error: ", error);
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;
