import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});

// ── CSRF Initialization ──────────────────────────────────
// Fetches the XSRF-TOKEN cookie before the first mutating request.
let csrfInitialized = false;

async function ensureCsrf(): Promise<void> {
  if (csrfInitialized) return;
  try {
    await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    csrfInitialized = true;
  } catch {
    console.error("Failed to fetch CSRF cookie");
  }
}

// ── Request Interceptor ──────────────────────────────────
AxiosInstance.interceptors.request.use(async (config) => {
  // Ensure CSRF cookie is set before any mutating request
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
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
}, (error) => {
    toast.error("Network configuration error.");
    return Promise.reject(error);
});

// ── Response Interceptor ─────────────────────────────────
AxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      toast.error("Network Error. Please check your connection.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Global 401 handler: redirect to login when session expires
    if (status === 401) {
      // Don't redirect if already on login/register or checking auth
      const currentPath = window.location.pathname;
      const isAuthRoute =
        currentPath === "/login" || currentPath === "/register";
      const isAuthCheck = error.config?.url?.endsWith("/me");

      if (!isAuthRoute && !isAuthCheck) {
        toast.info("Your session has expired. Please log in again.");
        window.location.href = "/login";
      }
    } else if (status >= 500) {
      toast.error("Server Error. Our team has been notified.");
    } else if (status === 403) {
      toast.error(data?.message || "You don't have permission to perform this action.");
    } else if (status === 404) {
      // 404 is usually handled by UI routing, but if an API specifically 404s, we log it softly.
      console.warn("API Resource Not Found: ", error.config?.url);
    } else if (status !== 422) {
      // 422 are validation errors, usually handled specifically in components
      toast.error(data?.message || "An unexpected error occurred.");
      console.error("Unexpected response error: ", error);
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;
