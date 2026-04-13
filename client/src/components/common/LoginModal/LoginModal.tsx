import React, { useState } from "react";
import "../../../App.css";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate } from "react-router-dom";
import LoginArt from "../../../assets/Login.png";
import { useAuth } from "../../../context/AuthContext";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
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
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const clearFieldError = (field: "email" | "password") => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!credentials.email.trim()) {
      newErrors.email = "Email address is required.";
      isValid = false;
    }

    if (!credentials.password) {
      newErrors.password = "Password is required.";
      isValid = false;
    }

    setFieldErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPasswordMode) {
      await handleForgotPassword();
      return;
    }
    setError(null);
    setIsPendingError(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await AxiosInstance.get(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:8000"
        }/sanctum/csrf-cookie`,
        { withCredentials: true },
      );

      const xsrfMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
      const xsrfToken = xsrfMatch
        ? decodeURIComponent(xsrfMatch[1])
        : undefined;

      const { data } = await AxiosInstance.post(
        "/login",
        {
          email: credentials.email,
          password: credentials.password,
        },
        {
          withCredentials: true,
          headers: xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : undefined,
        },
      );

      await checkAuth();
      onClose();

      if (data?.redirect) {
        navigate(data.redirect, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
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
    setFieldErrors({ email: "", password: "" });

    if (!credentials.email) {
      setFieldErrors({ email: "Please enter your email address to reset your password." });
      return;
    }

    setLoading(true);
    try {
      const response = await AxiosInstance.post('/forgot-password', { email: credentials.email });
      setForgotPasswordMessage(response.data.message || "Password reset link sent to your email.");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.response?.data?.errors?.email?.[0] || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="modal-container">
          <div className="modal-overlay" onClick={onClose} />
          {/* Added 'relative' here so the absolute button stays inside */}
          <div
            className={`modal-content login-modal__container relative bg-white dark:bg-gray-900 ${
              isOpen ? "open" : ""
            }`}
          >
            {/* THE NEW CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none z-50 md:hidden"
              aria-label="Close modal"
            >
              <FaTimes size={24} />
            </button>

            <div className="login-modal">
              <div className="login-modal__header pb-15">
                <img
                  src={LoginArt}
                  alt="HSE"
                  className="login-modal__logo ml-10"
                />
                <span className="login-modal__divider" aria-hidden="true" />
                <span className="login-modal__brand text-[#0b4b35] dark:text-green-400">HSE-ARCHIVE</span>
              </div>

              <form onSubmit={handleSubmit} className="login-modal__form">
                <h1 className="login-modal__title text-gray-900 dark:text-white">
                  {isForgotPasswordMode ? "RESET PASSWORD" : "LOG IN"}
                </h1>

                <div className="login-modal__group mb-4">
                  <input
                    className={`login-modal__input bg-[#f5f5f5] dark:bg-gray-800 border-2 border-[#efefef] dark:border-gray-700 text-gray-900 dark:text-gray-100 ${
                      fieldErrors.email ? "border-red-500 dark:border-red-500" : ""
                    }`}
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={(e) => {
                      setCredentials({ ...credentials, email: e.target.value });
                      clearFieldError("email");
                    }}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1 text-left">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {!isForgotPasswordMode && (
                  <div className="login-modal__group relative mb-4">
                    <input
                      className={`login-modal__input login-modal__input--password pr-10 bg-[#f5f5f5] dark:bg-gray-800 border-2 border-[#efefef] dark:border-gray-700 text-gray-900 dark:text-gray-100 ${
                        fieldErrors.password ? "border-red-500 dark:border-red-500" : ""
                      }`}
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={credentials.password}
                      onChange={(e) => {
                        setCredentials({
                          ...credentials,
                          password: e.target.value,
                        });
                        clearFieldError("password");
                      }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                    {fieldErrors.password && (
                      <p className="text-red-500 text-xs mt-1 text-left">
                        {fieldErrors.password}
                      </p>
                    )}
                  </div>
                )}

                {error && (
                  <div
                    className={`text-sm p-3 rounded-md mb-4 text-center ${
                      isPendingError
                        ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                        : "login-modal__error"
                    }`}
                  >
                    {isPendingError ? (
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold flex items-center gap-1">
                          ⚠️ Account Under Review
                        </span>
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

                <div className="flex justify-end mb-4">
                  {!isForgotPasswordMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPasswordMode(true);
                        setError(null);
                        setFieldErrors({ email: "", password: "" });
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
                        setFieldErrors({ email: "", password: "" });
                      }}
                      className="text-sm font-medium text-gray-500 hover:text-green-700 transition-colors"
                    >
                      Back to login
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-modal__submit mb-10"
                  disabled={loading}
                >
                  {loading ? "Processing..." : isForgotPasswordMode ? "SEND RESET LINK" : "LOG IN"}
                </button>

                <div className="text-center mt-4">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    No account yet?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/register");
                    }}
                    className="text-green-700 dark:text-green-500 font-bold hover:underline text-sm ml-1"
                  >
                    Register Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
