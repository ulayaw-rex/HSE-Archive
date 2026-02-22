import React, { useState } from "react";
import type { Publication } from "../../../types/Publication";
import ConfirmationModal from "../../common/ConfirmationModal";
import AxiosInstance from "../../../AxiosInstance";
import { useAuth } from "../../../context/AuthContext";

interface PublicationCardProps {
  publication: Publication;
  onEdit?: (publication: Publication) => void;
  onDelete?: (id: number) => void;
  onStatusChange?: () => void;
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
      await AxiosInstance.post(
        `/publications/${publication.publication_id}/status`,
        { action: pendingAction },
      );

      setConfirmModalOpen(false);
      setPendingAction(null);

      if (onStatusChange) {
        onStatusChange();
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
            initiateAction("review");
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md shadow-lg transition-all"
          title="Mark as Reviewed"
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </button>
      );
    }

    if (publication.status === "reviewed" && (isEIC || isAdmin)) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            initiateAction("approve");
          }}
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md shadow-lg transition-all"
          title="Approve Article"
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      );
    }

    if (publication.status === "approved" && (isEIC || isAdmin)) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            initiateAction("publish");
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md shadow-lg transition-all"
          title="Publish Live"
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
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
            />
          </svg>
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
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
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
