import React, { useState } from "react";
import type { Publication } from "../../../types/Publication";
import ConfirmationModal from "../../common/ConfirmationModal";
import AxiosInstance from "../../../AxiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { FaClipboardCheck, FaThumbsUp, FaRocket, FaUndo } from "react-icons/fa";

interface PublicationCardProps {
  publication: Publication;
  onEdit?: (publication: Publication) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: (updatedPublication?: Publication) => void;
  readOnly?: boolean;
  isManagementView?: boolean;
  onClick?: () => void;
}

const getCategoryColor = (category: string) => {
  const lowerCat = category.toLowerCase();
  switch (lowerCat) {
    case "university":
      return "bg-green-600";
    case "local":
      return "bg-blue-600";
    case "national":
      return "bg-red-600";
    case "entertainment":
      return "bg-purple-600";
    case "sci-tech":
      return "bg-indigo-600";
    case "sports":
      return "bg-orange-500";
    case "opinion":
      return "bg-teal-600";
    case "literary":
      return "bg-pink-600";
    default:
      return "bg-gray-600";
  }
};

const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  onEdit,
  onDelete,
  onStatusChange,
  readOnly = false,
  isManagementView = false,
  onClick,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const displayDate = new Date(
    publication.date_published || publication.created_at,
  );

  const badgeColorClass = getCategoryColor(publication.category);

  const initiateAction = (action: string) => {
    setPendingAction(action);
    setConfirmModalOpen(true);
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    setLoading(true);

    try {
      const response = await AxiosInstance.post(
        `/publications/${publication.publication_id}/status`,
        { action: pendingAction },
      );

      setConfirmModalOpen(false);
      setPendingAction(null);

      // THE FIX: Pass the updated data back up to the parent
      if (onStatusChange) {
        onStatusChange(response.data.data);
      }
    } catch (error: any) {
      console.error("Action failed", error);
      alert(error.response?.data?.error || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const renderActionButtons = () => {
    if (!isManagementView) return null;

    const pos = (user?.position || "").toLowerCase();
    const isAssociate = pos.includes("associate");
    const isEIC = pos.includes("chief");
    const isAdmin = user?.role === "admin";

    if (publication.status === "submitted" && (isAssociate || isAdmin)) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            initiateAction("approve");
          }}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md shadow-lg transition-all text-xs font-bold uppercase tracking-wider"
          title="Approve Article"
        >
          <FaThumbsUp size={14} /> Approve
        </button>
      );
    }

    if (publication.status === "approved" && (isEIC || isAdmin)) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            initiateAction("review");
          }}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-md shadow-lg transition-all text-xs font-bold uppercase tracking-wider"
          title="Review Article"
        >
          <FaClipboardCheck size={14} /> Review
        </button>
      );
    }

    if (publication.status === "reviewed" && (isEIC || isAdmin)) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            initiateAction("publish");
          }}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow-lg transition-all text-xs font-bold uppercase tracking-wider"
          title="Publish Live"
        >
          <FaRocket size={14} /> Publish
        </button>
      );
    }

    return null;
  };

  return (
    <>
      <div className="relative group">
        <div
          className="rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-300 relative bg-gray-300"
          style={{ minHeight: "250px" }}
          onClick={onClick}
        >
          {publication.image ? (
            <img
              src={publication.image}
              alt={publication.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <span className="text-4xl opacity-20">📰</span>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-transparent to-black/30"></div>

          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex flex-wrap gap-2 items-start">
              <span
                className={`inline-block text-white text-[10px] font-bold uppercase rounded-md px-2 py-1 shadow-sm tracking-wide ${badgeColorClass}`}
              >
                {publication.category}
              </span>
              {!readOnly && !isManagementView && (
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase ${publication.status === "returned" ? "bg-red-500 text-white" : publication.status === "submitted" ? "bg-blue-500 text-white" : "bg-gray-500 text-white"}`}
                >
                  {publication.status}
                </span>
              )}
            </div>

            <div className="text-white">
              <h3 className="text-xl font-bold mb-1 drop-shadow-md leading-tight text-white line-clamp-2">
                {publication.title}
              </h3>
              <div className="border-t border-white/40 w-full my-2"></div>
              <div className="flex justify-between items-end">
                <p className="text-sm text-gray-200 drop-shadow font-medium truncate max-w-[60%]">
                  {publication.byline || "Hillside Echo"}
                </p>
                <p className="text-xs text-gray-300 drop-shadow italic">
                  {displayDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex space-x-2 z-20">
          {isManagementView ? (
            <>
              {renderActionButtons()}
              {publication.status !== "published" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    initiateAction("return");
                  }}
                  disabled={loading}
                  title="Return"
                  className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md shadow-lg transition-all text-xs font-bold uppercase tracking-wider"
                >
                  <FaUndo size={14} /> Return
                </button>
              )}
            </>
          ) : readOnly ? null : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdit) onEdit(publication);
                }}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md shadow-lg transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onDelete) onDelete(publication.publication_id);
                }}
                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md shadow-lg transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmAction}
        isLoading={loading}
        title={
          pendingAction === "return"
            ? "Return Article?"
            : pendingAction === "publish"
              ? "Publish Article?"
              : "Approve Article?"
        }
        message={`Are you sure you want to ${pendingAction === "return" ? "return this article for revision" : "move this article to the next stage"}?`}
        confirmLabel="Yes, Proceed"
        cancelLabel="Cancel"
        isDangerous={pendingAction === "return"}
      />
    </>
  );
};

export default PublicationCard;
