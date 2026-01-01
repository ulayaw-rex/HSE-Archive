import React from "react";
import { FaTools, FaUserShield } from "react-icons/fa";
import { Link } from "react-router-dom";

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-6 font-sans">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg w-full border border-gray-100">
        <div className="bg-green-50 p-6 rounded-full inline-block mb-6 animate-pulse">
          <FaTools className="text-5xl text-green-700" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
          System Under Maintenance
        </h1>

        <p className="text-gray-500 mb-8 text-lg leading-relaxed">
          We are currently upgrading the system to serve you better.
          <br className="hidden sm:block" />
          Please check back shortly.
        </p>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 text-left rounded-r-lg shadow-sm">
          <div className="flex items-start gap-3">
            <FaUserShield className="text-yellow-600 mt-1 text-lg shrink-0" />
            <div>
              <p className="text-sm text-yellow-800 font-bold uppercase tracking-wide mb-1">
                Admin Access
              </p>
              <p className="text-sm text-yellow-700 leading-snug">
                Staff members and administrators can still access the dashboard
                via the{" "}
                <Link
                  to="/login"
                  className="font-semibold underline decoration-yellow-600 hover:text-yellow-900 transition-colors"
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
