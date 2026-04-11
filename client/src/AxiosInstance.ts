import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.PROD
  ? "" 
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const AxiosInstance = axios.create({
  baseURL: import.meta.env.PROD ? "/api" : API_BASE_URL,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
  },
});

let csrfInitialized = false;

async function ensureCsrf(): Promise<void> {
  if (csrfInitialized) return;
  try {
    const csrfPath = import.meta.env.PROD
      ? "/sanctum/csrf-cookie"
      : API_BASE_URL.replace(/\/api\/?$/, "") + "/sanctum/csrf-cookie";

    await axios.get(csrfPath, {
      withCredentials: true,
    });
    csrfInitialized = true;
  } catch (error) {
    console.error("Failed to fetch CSRF cookie", error);
  }
}

AxiosInstance.interceptors.request.use(
  async (config) => {
    const mutatingMethods = ["post", "put", "patch", "delete"];
    if (mutatingMethods.includes(config.method?.toLowerCase() ?? "")) {
      await ensureCsrf();
    }

    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    if (token) {
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
    }

    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

AxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAdminPath = window.location.pathname.startsWith("/admin");
    if (!error.response) {
      if (isAdminPath) toast.error("Network Error. Please check your connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    if (status === 401) {
      const currentPath = window.location.pathname;
      const isAuthRoute =
        currentPath === "/login" || currentPath === "/register";
      const isAuthCheck = error.config?.url?.endsWith("/me");

      if (!isAuthRoute && !isAuthCheck) {
        if (isAdminPath) toast.info("Your session has expired.");
        window.location.href = "/";
      }
    } else if (status === 419) {
      csrfInitialized = false;
      if (isAdminPath) toast.error("Security session expired. Please try again.");
    } else if (status >= 500) {
      if (isAdminPath) toast.error("Server Error. Please try again later.");
    } else if (status === 403) {
      if (isAdminPath) toast.error(data?.message || "Action unauthorized.");
    } else if (status !== 422) {
      if (isAdminPath) toast.error(data?.message || "An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;