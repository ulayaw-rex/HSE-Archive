import React from "react";
import AxiosInstance from "../../../AxiosInstance";
import { toast } from "react-toastify";
import { FaCheck, FaTimes, FaUserEdit } from "react-icons/fa";

interface CreditRequest {
  id: number;
  user: { id: number; name: string; email: string };
  requestable_type: string;
  requestable: { id: number; title: string } | null;
  created_at: string;
}

interface CreditRequestsWidgetProps {
  requests: CreditRequest[];
  onActionComplete: () => void;
}

const CreditRequestsWidget: React.FC<CreditRequestsWidgetProps> = ({
  requests,
  onActionComplete,
}) => {
  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      await AxiosInstance.put(`/admin/credit-requests/${id}/${action}`);
      toast.success(`Request ${action}d successfully.`);
      onActionComplete();
    } catch (error) {
      toast.error("Action failed.");
    }
  };

  const getClaimText = (type: string) => {
    if (type.includes("PrintMedia")) return "claims ownership of:";
    return "claims to have written:";
  };

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
          <div className="flex flex-col items-center justify-center h-full py-10 text-center">
            <div className="text-green-500 text-3xl mb-3">✓</div>
            <h3 className="text-gray-800 font-bold text-sm">All Caught Up!</h3>
            <p className="text-gray-400 text-xs mt-1">
              No pending authorship claims.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-4 hover:bg-gray-50 flex flex-col gap-2 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2">
                    <p className="text-sm font-bold text-gray-800">
                      {req.user.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {getClaimText(req.requestable_type)}
                    </p>

                    {req.requestable ? (
                      <p className="text-xs font-semibold text-blue-600 line-clamp-2 leading-snug">
                        "{req.requestable.title}"
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-red-400 italic">
                        [Item Deleted]
                      </p>
                    )}

                    <span className="inline-block mt-1.5 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-wide border border-gray-200 font-medium">
                      {req.requestable_type.includes("PrintMedia")
                        ? "Print Media"
                        : "Article"}
                    </span>
                  </div>

                  <div className="flex gap-1 items-center">
                    <button
                      onClick={() => handleAction(req.id, "approve")}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Approve"
                    >
                      <FaCheck size={14} />
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "reject")}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="Reject"
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
  );
};

export default CreditRequestsWidget;
