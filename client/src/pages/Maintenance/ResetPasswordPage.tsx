import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import LoginArt from "../../assets/Login.png";
import { FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import "../../App.css";

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token || !email) {
      setError(
        "Invalid or missing reset link. Please request a new password reset.",
      );
    }
  }, [token, email]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!formData.password) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
      isValid = false;
    } else if (
      !/[a-z]/.test(formData.password) ||
      !/[A-Z]/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain both uppercase and lowercase letters.";
      isValid = false;
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number.";
      isValid = false;
    } else if (
      !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
    ) {
      newErrors.password =
        "Password must contain at least one special character (!@#$%^&*).";
      isValid = false;
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password.";
      isValid = false;
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (!token || !email) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setLoading(true);

    try {
      await AxiosInstance.post("/reset-password", {
        token,
        email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.password?.[0] ||
        err?.response?.data?.errors?.token?.[0] ||
        "Failed to reset password. The link may have expired.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#005e2b] dark:bg-gray-950 p-4 font-sans transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row border border-transparent dark:border-gray-700 overflow-hidden">
        {/* Left Side - Image and Branding */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900/50 w-full md:w-1/2 p-8 border-r border-gray-100 dark:border-gray-700">
          <img
            src={LoginArt}
            alt="HSE"
            className="max-w-[200px] mb-6 dark:opacity-80 transition-opacity"
          />
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-500 tracking-wider">
              HSE-ARCHIVE
            </h2>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          {success ? (
            <div className="flex flex-col items-center justify-center text-center">
              <FaCheckCircle className="text-green-600 dark:text-green-400 text-6xl mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                Your password has been reset successfully. You will be
                redirected to the login page in 3 seconds.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="bg-green-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-800 transition-colors"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 uppercase">
                Reset Password
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Enter your new password below.
              </p>

              {error && (
                <div className="text-sm p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 mb-4">
                  {error}
                </div>
              )}

              {/* Password Field */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 pr-10 ${
                      errors.password
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
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
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="mb-4">
                <div className="relative">
                  <input
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none transition-all bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 pr-10 ${
                      errors.password_confirmation
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.password_confirmation}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        password_confirmation: e.target.value,
                      });
                      if (errors.password_confirmation) {
                        setErrors((prev) => ({
                          ...prev,
                          password_confirmation: "",
                        }));
                      }
                    }}
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.password_confirmation}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-400 mb-6">
                <p className="font-bold mb-2">Password Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>At least 8 characters</li>
                  <li>Mix of uppercase and lowercase letters</li>
                  <li>At least one number</li>
                  <li>At least one special character (!@#$%^&*)</li>
                </ul>
              </div>

              <button
                type="submit"
                className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50"
                disabled={loading || !token || !email}
              >
                {loading ? "Resetting Password..." : "RESET PASSWORD"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors"
                >
                  &larr; Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
