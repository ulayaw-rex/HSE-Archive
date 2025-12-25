import React, { useEffect, useState } from "react";
import AxiosInstance from "../../../AxiosInstance";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaUserEdit } from "react-icons/fa";

interface Request {
  id: number;
  user: { id: number; name: string; email: string };
  publication: { publication_id: number; title: string };
  created_at: string;
}

const CreditRequestsWidget: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await AxiosInstance.get("/admin/credit-requests");
      setRequests(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await AxiosInstance.put(`/admin/credit-requests/${id}/${action}`);
      toast.success(`Request ${action}d successfully.`);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  if (loading) return <div>Loading requests...</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
      <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
            <FaUserEdit />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Authorship Claims</h3>
            <p className="text-xs text-purple-700 font-medium">
              Pending verification
            </p>
          </div>
        </div>
        <span className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded-full">
          {requests.length}
        </span>
      </div>

      <div
        className="overflow-y-auto p-0 flex-1 custom-scrollbar"
        style={{ maxHeight: "300px" }}
      >
        {requests.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            No pending claims.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 hover:bg-gray-50 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {req.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      claims to have written:
                    </p>
                    <p className="text-xs font-semibold text-blue-600 mt-1 line-clamp-1">
                      "{req.publication.title}"
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(req.id, "approve")}
                      className="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200"
                      title="Approve"
                    >
                      <FaCheck size={12} />
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "reject")}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                      title="Reject"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditRequestsWidget;
