import React, { useState } from "react";
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

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: "approve" | "reject";
  request: CreditRequest | null;
  isLoading: boolean;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  request,
  isLoading,
}) => {
  if (!isOpen || !request) return null;

  const isApprove = action === "approve";
  const colorClass = isApprove
    ? "text-green-600 bg-green-100"
    : "text-red-600 bg-red-100";
  const btnColorClass = isApprove
    ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
    : "bg-red-600 hover:bg-red-700 focus:ring-red-500";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 overflow-hidden">
        <div
          className={`absolute top-0 left-0 w-full h-1.5 ${
            isApprove ? "bg-green-500" : "bg-red-500"
          }`}
        />

        <div className="text-center">
          <div
            className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${colorClass}`}
          >
            {isApprove ? (
              <FaCheck className="h-7 w-7" />
            ) : (
              <FaTimes className="h-7 w-7" />
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
            {action} Request?
          </h3>

          <div className="text-sm text-gray-500 mb-6 leading-relaxed px-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="mb-2">
              User:{" "}
              <span className="font-semibold text-gray-800">
                {request.user.name}
              </span>
            </p>
            <p>
              Claim:{" "}
              <span className="italic text-gray-700">
                "{request.requestable?.title || "Unknown Item"}"
              </span>
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2.5 text-white font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all flex items-center gap-2 ${btnColorClass}`}
            >
              {isLoading
                ? "Processing..."
                : `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreditRequestsWidget: React.FC<CreditRequestsWidgetProps> = ({
  requests,
  onActionComplete,
}) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: "approve" | "reject";
    request: CreditRequest | null;
  }>({
    isOpen: false,
    action: "approve",
    request: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  const openConfirmation = (
    req: CreditRequest,
    action: "approve" | "reject"
  ) => {
    setModalState({ isOpen: true, action, request: req });
  };

  const handleConfirmAction = async () => {
    const { request, action } = modalState;
    if (!request) return;

    setIsLoading(true);
    try {
      await AxiosInstance.put(`/admin/credit-requests/${request.id}/${action}`);
      toast.success(`Request ${action}d successfully.`);
      onActionComplete();
      setModalState((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      toast.error("Action failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getClaimText = (type: string) => {
    if (type.includes("PrintMedia")) return "claims ownership of:";
    return "claims to have written:";
  };

  return (
    <>
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
              <h3 className="text-gray-800 font-bold text-sm">
                All Caught Up!
              </h3>
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
                        onClick={() => openConfirmation(req, "approve")}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        title="Approve"
                      >
                        <FaCheck size={14} />
                      </button>
                      <button
                        onClick={() => openConfirmation(req, "reject")}
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

      <ConfirmActionModal
        isOpen={modalState.isOpen}
        action={modalState.action}
        request={modalState.request}
        isLoading={isLoading}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmAction}
      />
    </>
  );
};

export default CreditRequestsWidget;
