import React from "react";
import { FaTools, FaUserShield } from "react-icons/fa";
import { Link } from "react-router-dom";

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-300 p-6 font-sans transition-colors duration-200">
      <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-xl text-center max-w-lg w-full border border-gray-100 dark:border-gray-800">
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-full inline-block mb-6 animate-pulse">
          <FaTools className="text-5xl text-green-700 dark:text-green-500" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-3 tracking-tight">
          System Under Maintenance
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg leading-relaxed">
          We are currently upgrading the system to serve you better.
          <br className="hidden sm:block" />
          Please check back shortly.
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-700 p-5 text-left rounded-r-lg shadow-sm">
          <div className="flex items-start gap-3">
            <FaUserShield className="text-yellow-600 dark:text-yellow-500 mt-1 text-lg shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 dark:text-yellow-400 font-bold uppercase tracking-wide mb-1">
                Admin Access
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-500/90 leading-snug">
                Staff members and administrators can still access the dashboard
                via the{" "}
                <Link
                  to="/login"
                  className="font-semibold underline decoration-yellow-600 dark:decoration-yellow-500 hover:text-yellow-900 dark:hover:text-yellow-300 transition-colors"
                >
                  Login Portal
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-gray-400">
          &copy; {new Date().getFullYear()} The Hillside Echo. All rights
          reserved.
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
