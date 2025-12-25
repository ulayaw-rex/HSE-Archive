import React, { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaUserClock, FaSpinner } from "react-icons/fa";
import ConfirmationModal from "../../common/ConfirmationModal";

interface PendingUser {
  id: number;
  name: string;
  email: string;
  role: string;
  course: string;
  position: string;
  created_at: string;
}

const PendingUsersWidget: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [isRejecting, setIsRejecting] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [userToReject, setUserToReject] = useState<number | null>(null);

  const fetchPendingUsers = async () => {
    try {
      const response = await AxiosInstance.get("/users");
      const pending = response.data.filter((u: any) => u.status === "pending");
      setPendingUsers(pending);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      await AxiosInstance.put(`/users/${id}/approve`);
      toast.success("User approved! Approval email sent.");
      setPendingUsers((prev) => prev.filter((user) => user.id !== id));
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
      setPendingUsers((prev) =>
        prev.filter((user) => user.id !== userToReject)
      );
      setIsRejectModalOpen(false);
      setUserToReject(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to decline user");
    } finally {
      setIsRejecting(false);
    }
  };

  if (loading)
    return (
      <div className="p-4 text-center text-gray-500">
        Loading pending users...
      </div>
    );

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
              <FaUserClock />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Pending Registrations</h3>
              <p className="text-xs text-yellow-700 font-medium">
                Requires your approval
              </p>
            </div>
          </div>
          <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
            {pendingUsers.length}
          </span>
        </div>

        <div
          className="overflow-y-auto p-0 flex-1 custom-scrollbar"
          style={{ maxHeight: "300px" }}
        >
          {pendingUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              No pending registration requests.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">{user.name}</h4>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 capitalize">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{user.email}</p>
                    <div className="text-xs text-gray-400 flex flex-wrap gap-x-3">
                      {user.course && <span>🎓 {user.course}</span>}
                      {user.position && <span>💼 {user.position}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(user.id)}
                      disabled={actionLoadingId === user.id}
                      className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all shadow-sm ${
                        actionLoadingId === user.id
                          ? "bg-green-700 text-white opacity-75 cursor-wait"
                          : "bg-green-600 hover:bg-green-700 text-white hover:shadow-md"
                      }`}
                    >
                      {actionLoadingId === user.id ? (
                        <>
                          <FaSpinner className="animate-spin" size={12} />{" "}
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaCheck size={12} /> Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeclineClick(user.id)}
                      disabled={actionLoadingId === user.id}
                      className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                        actionLoadingId === user.id
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-red-100 hover:bg-red-200 text-red-700"
                      }`}
                    >
                      <FaTimes size={12} /> Decline
                    </button>
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
