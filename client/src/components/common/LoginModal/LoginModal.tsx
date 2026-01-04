import React, { useState } from "react";
import "../../../App.css";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate } from "react-router-dom";
import LoginArt from "../../../assets/Login.png";
import { useAuth } from "../../../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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
        { withCredentials: true }
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
        }
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

  return (
    <>
      {isOpen && (
        <div className="modal-container">
          <div className="modal-overlay" onClick={onClose} />
          <div
            className={`modal-content login-modal__container ${
              isOpen ? "open" : ""
            }`}
          >
            <div className="login-modal">
              <div className="login-modal__header pb-15">
                <img
                  src={LoginArt}
                  alt="HSE"
                  className="login-modal__logo ml-10"
                />
                <span className="login-modal__divider" aria-hidden="true" />
                <span className="login-modal__brand">HSE-ARCHIVE</span>
              </div>

              <form onSubmit={handleSubmit} className="login-modal__form">
                <h1 className="login-modal__title">LOG IN</h1>

                <div className="login-modal__group mb-4">
                  <input
                    className={`login-modal__input ${
                      fieldErrors.email ? "border-2 border-red-500" : ""
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

                <div className="login-modal__group relative mb-4">
                  <input
                    className={`login-modal__input login-modal__input--password pr-10 ${
                      fieldErrors.password ? "border-2 border-red-500" : ""
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

                <a href="#" className="login-modal__forgot pl-37"></a>

                <button
                  type="submit"
                  className="login-modal__submit mb-15"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "LOG IN"}
                </button>

                <div className="text-center mt-4">
                  <span className="text-gray-600 text-sm">
                    No account yet?{" "}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate("/register");
                    }}
                    className="text-green-700 font-bold hover:underline text-sm ml-1"
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
