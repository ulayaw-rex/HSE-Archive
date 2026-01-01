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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPendingError(false);
    setLoading(true);

    try {
      await AxiosInstance.get(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/sanctum/csrf-cookie`,
        { withCredentials: true }
      );

      await AxiosInstance.post(
        "/login",
        {
          email: credentials.email,
          password: credentials.password,
        },
        { withCredentials: true }
      );

      const user = await checkAuth();

      const statusRes = await AxiosInstance.get("/analytics/system-status");
      const isLocked = statusRes.data.locked;

      if (isLocked && user?.role !== "admin") {
        await AxiosInstance.post("/logout");
        await checkAuth();
        setError(
          "System is currently under maintenance. Only administrators can log in."
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row">
        <div className="hidden md:flex flex-col justify-center items-center bg-gray-50 w-1/2 p-8 border-r border-gray-100">
          <img src={LoginArt} alt="HSE" className="max-w-[200px] mb-6" />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-800 tracking-wider">
              HSE-ARCHIVE
            </h2>
            <p className="text-sm text-gray-500 mt-2">Admin Portal</p>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="md:hidden text-center mb-6">
            <img src={LoginArt} alt="HSE" className="h-12 mx-auto" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
              LOG IN
            </h1>

            <div className="flex flex-col gap-1">
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                type="email"
                placeholder="Email"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
              />
            </div>

            <div className="relative">
              <input
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all pr-10"
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
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {error && (
              <div
                className={`text-sm p-3 rounded-md text-center ${
                  isPendingError
                    ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                    : "bg-red-50 text-red-600 border border-red-200"
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

            <button
              type="submit"
              className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition-colors mt-2"
              disabled={loading}
            >
              {loading ? "Signing in..." : "LOG IN"}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-gray-400 hover:text-green-600 text-sm"
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
