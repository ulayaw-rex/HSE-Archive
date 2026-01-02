import React, { useState, useEffect, useRef } from "react";
import AxiosInstance from "../../AxiosInstance";
import {
  FaTools,
  FaCheckCircle,
  FaExclamationTriangle,
  FaServer,
  FaToggleOn,
  FaToggleOff,
  FaInfoCircle,
  FaTimes,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  isLocked: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const ConfirmationModal: React.FC<ModalProps> = ({
  isOpen,
  isLocked,
  onClose,
  onConfirm,
  isLoading,
}) => {
  if (!isOpen) return null;

  const isLocking = !isLocked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-fade-in-up">
        <div
          className={`p-4 flex items-center justify-between ${
            isLocking ? "bg-red-50" : "bg-green-50"
          }`}
        >
          <h3
            className={`font-bold text-lg flex items-center gap-2 ${
              isLocking ? "text-red-700" : "text-green-700"
            }`}
          >
            {isLocking ? <FaLock /> : <FaUnlock />}
            {isLocking ? "Enable Maintenance?" : "Restore Access?"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {isLocking ? (
              <>
                You are about to{" "}
                <span className="font-bold text-red-600">LOCK</span> the system.
                Regular users will be blocked from logging in or posting content
                immediately.
              </>
            ) : (
              <>
                You are about to{" "}
                <span className="font-bold text-green-600">UNLOCK</span> the
                system. All user access will be restored immediately.
              </>
            )}
          </p>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-500 flex gap-2 items-start">
            <FaInfoCircle className="mt-0.5 text-blue-500 shrink-0" />
            <span>
              This action is logged in the Audit Trail for security purposes.
            </span>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm flex items-center gap-2 transition-colors ${
              isLocking
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } ${isLoading ? "opacity-70 cursor-wait" : ""}`}
          >
            {isLoading
              ? "Processing..."
              : isLocking
              ? "Confirm Lockdown"
              : "Confirm Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ModuleSkeleton = () => (
  <div className="rounded-2xl shadow-sm border border-gray-100 bg-white p-6 animate-pulse h-full">
    <div className="flex justify-between items-start mb-4">
      <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
      <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 w-full bg-gray-200 rounded mb-6"></div>
    <div className="h-10 w-full bg-gray-200 rounded-lg border border-gray-100"></div>
    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
      <div className="h-4 w-20 bg-gray-200 rounded"></div>
      <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const Modules: React.FC = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const res = await AxiosInstance.get("/analytics/system-status");
      if (isMounted.current) {
        setIsLocked(res.data.locked);
      }
    } catch (error) {
      console.error("Error fetching status", error);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const initiateToggle = () => {
    setShowModal(true);
  };

  const confirmToggle = async () => {
    setToggling(true);
    try {
      const res = await AxiosInstance.post("/analytics/toggle-status");
      if (isMounted.current) {
        setIsLocked(res.data.locked);
        setShowModal(false);
      }
    } catch (error) {
      alert("Failed to toggle system status.");
    } finally {
      if (isMounted.current) setToggling(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <ConfirmationModal
        isOpen={showModal}
        isLocked={isLocked}
        onClose={() => setShowModal(false)}
        onConfirm={confirmToggle}
        isLoading={toggling}
      />

      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          System Modules
        </h1>
        <p className="text-gray-500 text-base md:text-lg">
          Manage core system functionalities and maintenance protocols.
        </p>
        <div className="h-1 w-20 bg-green-600 mt-4 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {loading ? (
          <ModuleSkeleton />
        ) : (
          <div
            className={`relative overflow-hidden rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
              isLocked ? "bg-white border-red-200" : "bg-white border-gray-100"
            }`}
          >
            <div
              className={`h-2 w-full ${
                isLocked ? "bg-red-500" : "bg-green-500"
              }`}
            />

            <div className="p-5 md:p-6">
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-xl ${
                    isLocked
                      ? "bg-red-100 text-red-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {isLocked ? <FaTools size={24} /> : <FaServer size={24} />}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    isLocked
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : "bg-green-100 text-green-700 border border-green-200"
                  }`}
                >
                  {isLocked ? "Maintenance" : "System Online"}
                </span>
              </div>

              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                System Maintenance
              </h3>

              <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
                {isLocked
                  ? "Global lockdown active. Only administrators have access."
                  : "All systems operational. Regular user access is enabled."}
              </p>

              <div
                className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
                  isLocked
                    ? "bg-red-50 border-red-100"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                {isLocked ? (
                  <FaExclamationTriangle className="text-red-500 shrink-0" />
                ) : (
                  <FaCheckCircle className="text-green-500 shrink-0" />
                )}
                <span
                  className={`text-sm font-medium ${
                    isLocked ? "text-red-700" : "text-gray-600"
                  }`}
                >
                  {isLocked ? "Public Access Blocked" : "Public Access Active"}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase">
                  Status Control
                </span>

                <button
                  onClick={initiateToggle}
                  disabled={toggling}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm focus:ring-4 ${
                    isLocked
                      ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-200"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-100"
                  } ${toggling ? "opacity-70 cursor-wait" : ""}`}
                >
                  <span className="text-sm">
                    {isLocked ? "Turn Off" : "Turn On"}
                  </span>
                  <div
                    className={`text-lg ${
                      isLocked ? "text-white" : "text-green-600"
                    }`}
                  >
                    {isLocked ? (
                      <FaToggleOn />
                    ) : (
                      <FaToggleOff className="text-gray-400" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-gray-400 hover:border-gray-300 transition-colors h-full min-h-[300px]">
          <div className="bg-gray-50 p-4 rounded-full mb-3">
            <FaInfoCircle size={24} className="text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-500">
            More Modules Coming Soon
          </h3>
          <p className="text-xs mt-1">Feedback, Alumni, and more.</p>
        </div>
      </div>
    </div>
  );
};

export default Modules;
