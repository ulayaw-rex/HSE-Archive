import React, { useState } from "react";
import "../../../App.css";
import AxiosInstance from "../../../AxiosInstance";
import { useNavigate } from "react-router-dom";
import LoginArt from "../../../assets/Login.png";
import { useAuth } from "../../../context/AuthContext";

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

                <div className="login-modal__group">
                  <input
                    className="login-modal__input"
                    type="email"
                    placeholder="Username"
                    value={credentials.email}
                    onChange={(e) =>
                      setCredentials({ ...credentials, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="login-modal__group">
                  <input
                    className="login-modal__input login-modal__input--password"
                    type="password"
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

                <a href="#" className="login-modal__forgot pl-37">
                  Forgot password?
                </a>

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
