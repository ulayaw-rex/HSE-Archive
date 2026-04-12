import React, { useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaUserClock, FaSpinner } from "react-icons/fa";
import ConfirmationModal from "../../common/ConfirmationModal";

export interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  course: string;
  position: string;
  created_at: string;
}

interface PendingUsersWidgetProps {
  users: PendingUser[];
  onActionComplete: () => void;
}

const PendingUsersWidget: React.FC<PendingUsersWidgetProps> = ({
  users,
  onActionComplete,
}) => {
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [userToReject, setUserToReject] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      await AxiosInstance.put(`/users/${id}/approve`);
      toast.success("User approved! Approval email sent.");
      onActionComplete();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve user");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineClick = (id: number) => {
    setUserToReject(id);
    setIsRejectModalOpen(true);
  };

  const confirmRejection = async () => {
    if (!userToReject) return;

    setIsRejecting(true);
    try {
      await AxiosInstance.delete(`/users/${userToReject}`);
      toast.info("User rejected. Notification email sent.");
      onActionComplete();
      setIsRejectModalOpen(false);
      setUserToReject(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to decline user");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isRejectModalOpen}
        onClose={() => !isRejecting && setIsRejectModalOpen(false)}
        onConfirm={confirmRejection}
        title="Reject Registration?"
        message="Are you sure you want to decline this user? They will receive an email notification explaining why."
        confirmLabel="Yes, Decline"
        cancelLabel="Cancel"
        isDangerous={true}
        isLoading={isRejecting}
      />

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-white/5 overflow-hidden flex flex-col h-full transition-colors duration-200">
        <div className="bg-yellow-50 dark:bg-yellow-900/10 px-6 py-4 border-b border-yellow-100 dark:border-yellow-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-700 dark:text-yellow-500">
              <FaUserClock />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200">
                Pending Registrations
              </h3>
              <p className="text-xs text-yellow-700 dark:text-yellow-500 font-medium">
                Requires your approval
              </p>
            </div>
          </div>
          <span className="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400 text-xs font-bold px-2 py-1 rounded-full">
            {users.length}
          </span>
        </div>

        <div
          className="overflow-y-auto p-0 flex-1 custom-scrollbar"
          style={{ maxHeight: "300px" }}
        >
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="text-green-500 text-3xl mb-3">✓</div>
              <h3 className="text-gray-800 dark:text-gray-200 font-bold text-sm">
                All Caught Up!
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                No pending registration requests.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          {user.name}
                        </h4>
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/10 capitalize">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">
                        {user.email}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 dark:text-gray-500">
                        {user.course && (
                          <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
                            🎓 {user.course}
                          </span>
                        )}
                        {user.position && (
                          <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-1.5 py-0.5 rounded">
                            💼 {user.position}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleApprove(user.id)}
                        disabled={actionLoadingId === user.id}
                        className={`p-2 rounded-lg transition-colors ${
                          actionLoadingId === user.id
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500 opacity-70"
                            : "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40"
                        }`}
                        title="Approve"
                      >
                        {actionLoadingId === user.id ? (
                          <FaSpinner className="animate-spin" size={14} />
                        ) : (
                          <FaCheck size={14} />
                        )}
                      </button>

                      <button
                        onClick={() => handleDeclineClick(user.id)}
                        disabled={actionLoadingId === user.id}
                        className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                        title="Decline"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PendingUsersWidget;
