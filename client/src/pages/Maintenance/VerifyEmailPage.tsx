import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { useAuth } from "../../context/AuthContext";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const verifyUrl = searchParams.get("verify_url");
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string | null }>({
    type: null,
    message: null,
  });

  useEffect(() => {
    if (verifyUrl) {
      const verify = async () => {
        setVerifying(true);
        setStatus({ type: null, message: null });
        try {
          await AxiosInstance.get(verifyUrl);
          setStatus({
            type: "success",
            message: "Email successfully verified! Redirecting you...",
          });
          // Re-fetch auth user state to clear verification barrier
          await checkAuth();
          setTimeout(() => navigate("/"), 2000);
        } catch (error: any) {
          setStatus({
            type: "error",
            message:
              error.response?.data?.message ||
              "Verification link is invalid or expired.",
          });
        } finally {
          setVerifying(false);
        }
      };

      verify();
    }
  }, [verifyUrl, navigate, checkAuth]);

  const handleResend = async () => {
    setResending(true);
    setStatus({ type: null, message: null });
    try {
      await AxiosInstance.post("/email/verification-notification");
      setStatus({
        type: "success",
        message: "Verification link sent to your email address.",
      });
    } catch (error: any) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to resend link. You may be rate limited.",
      });
    } finally {
      setResending(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-12 h-12 border-4 border-green-600 dark:border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium transition-colors">Verifying your email address...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center border border-transparent dark:border-gray-800">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <svg className="h-6 w-6 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">Verify your Email</h2>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
            We need to verify it's really you. Please check your email for a verification link.
          </p>

          {status.message && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm font-medium animate-fadeIn ${
                status.type === "success"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
              }`}
            >
              {status.message}
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={resending || status.type === "success"}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-green-700 hover:bg-green-800 focus:outline-none disabled:opacity-50 transition-colors"
          >
            {resending ? "Sending..." : "Resend Verification Email"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
