import React, { useState } from "react";
import "../../App.css";
import AxiosInstance from "../../AxiosInstance";
import { useNavigate } from "react-router-dom";
import LoginArt from "../../assets/Login.png";
import { useAuth } from "../../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPendingError, setIsPendingError] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<
    string | null
  >(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPasswordMode) {
      await handleForgotPassword();
      return;
    }
    setError(null);
    setIsPendingError(false);
    setLoading(true);

    try {
      await AxiosInstance.get(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/sanctum/csrf-cookie`,
        { withCredentials: true },
      );

      await AxiosInstance.post(
        "/login",
        {
          email: credentials.email,
          password: credentials.password,
        },
        { withCredentials: true },
      );

      const user = await checkAuth();

      const statusRes = await AxiosInstance.get("/analytics/system-status");
      const isLocked = statusRes.data.locked;

      if (isLocked && user?.role !== "admin") {
        await AxiosInstance.post("/logout");
        await checkAuth();
        setError(
          "System is currently under maintenance. Only administrators can log in.",
        );
        setLoading(false);
        return;
      }

      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 403) {
        setIsPendingError(true);
        setError(err.response.data.message);
      } else {
        const message =
          err?.response?.data?.message ||
          err?.response?.data?.errors?.email?.[0] ||
          "Login failed. Please check your credentials.";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setForgotPasswordMessage(null);

    if (!credentials.email) {
      setError("Please enter your email address to reset your password.");
      return;
    }

    setLoading(true);
    try {
      const response = await AxiosInstance.post("/forgot-password", {
        email: credentials.email,
      });
      setForgotPasswordMessage(
        response.data.message || "Password reset link sent to your email.",
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.email?.[0] ||
          "Failed to send reset link.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row border border-transparent dark:border-gray-700">
        <div className="hidden md:flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900/50 w-1/2 p-8 border-r border-gray-100 dark:border-gray-700">
          <img
            src={LoginArt}
            alt="HSE"
            className="max-w-[200px] mb-6 dark:opacity-80 transition-opacity"
          />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-500 tracking-wider">
              HSE-ARCHIVE
            </h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 font-medium">
              Admin Portal
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="md:hidden text-center mb-6">
            <img src={LoginArt} alt="HSE" className="h-12 mx-auto" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center md:text-left uppercase">
              {isForgotPasswordMode ? "Reset Password" : "LOG IN"}
            </h1>

            <div className="flex flex-col gap-1">
              <input
                className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                type="email"
                placeholder="Email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
              />
            </div>

            {!isForgotPasswordMode && (
              <div className="relative">
                <input
                  className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all pr-10"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      password: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash size={18} />
                  ) : (
                    <FaEye size={18} />
                  )}
                </button>
              </div>
            )}

            {error && (
              <div
                className={`text-sm p-3 rounded-md text-center border ${
                  isPendingError
                    ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30"
                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30"
                }`}
              >
                {isPendingError ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold">⚠️ Account Under Review</span>
                    <span className="text-xs">{error}</span>
                  </div>
                ) : (
                  error
                )}
              </div>
            )}

            {forgotPasswordMessage && (
              <div className="text-sm p-3 rounded-md mb-4 text-center bg-green-50 text-green-800 border border-green-200">
                {forgotPasswordMessage}
              </div>
            )}

            <div className="flex justify-end">
              {!isForgotPasswordMode ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(true);
                    setError(null);
                  }}
                  className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors"
                >
                  Forgot password?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordMode(false);
                    setError(null);
                    setForgotPasswordMessage(null);
                  }}
                  className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors"
                >
                  Back to login
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition-colors mt-2"
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : isForgotPasswordMode
                  ? "SEND RESET LINK"
                  : "LOG IN"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors"
              >
                &larr; Back to Site
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
