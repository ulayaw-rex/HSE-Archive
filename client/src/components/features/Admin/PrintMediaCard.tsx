import React, { useState, useCallback } from "react";
import type { PrintMedia } from "../../../types/PrintMedia";
import ConfirmationModal from "../../common/ConfirmationModal";
import "../../../App.css";

interface PrintMediaCardProps {
  printMedia: PrintMedia;
  onEdit: (printMedia: PrintMedia) => void;
  onDelete: (id: number) => void;
  onView: (printMedia: PrintMedia) => void;
}

const getCategoryColor = (type: string) => {
  const lowerType = type.toLowerCase();
  switch (lowerType) {
    case "magazine":
      return "bg-blue-600";
    case "tabloid":
      return "bg-orange-500";
    case "folio":
      return "bg-purple-600";
    case "newsletter":
      return "bg-teal-600";
    case "other":
    default:
      return "bg-gray-600";
  }
};

const PrintMediaCard: React.FC<PrintMediaCardProps> = ({
  printMedia,
  onEdit,
  onDelete,
  onView,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const thumbnailUrl = printMedia.thumbnail_path
    ? `/api/print-media/file/${printMedia.thumbnail_path}`
    : null;

  const displayDate = new Date(
    printMedia.date_published || printMedia.created_at
  );

  const badgeColorClass = getCategoryColor(printMedia.type);

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(printMedia);
    },
    [onEdit, printMedia]
  );

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    onDelete(printMedia.print_media_id);
    setIsConfirmOpen(false);
  }, [onDelete, printMedia.print_media_id]);

  const handleCardClick = useCallback(() => {
    onView(printMedia);
  }, [onView, printMedia]);

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
  }, []);

  return (
    <>
      <div className="relative group">
        <div
          className="rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-300 relative bg-gray-300"
          style={{ minHeight: "250px" }}
          onClick={handleCardClick}
        >
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={printMedia.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30"></div>

          <div className="absolute inset-0 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span
                className={`inline-block text-white text-xs font-bold uppercase rounded-md px-2 py-1 shadow-sm tracking-wide ${badgeColorClass}`}
              >
                {printMedia.type}
              </span>
            </div>

            <div className="text-white">
              <h3 className="text-xl font-bold mb-1 drop-shadow-md leading-tight text-white">
                {printMedia.title}
              </h3>

              <div className="border-t border-white/40 w-full my-2"></div>

              <div className="flex justify-between items-end">
                <p className="text-sm text-gray-200 drop-shadow font-medium">
                  {printMedia.byline || "Hillside Echo"}
                </p>
                <p className="text-xs text-gray-300 drop-shadow italic">
                  {displayDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex space-x-2 z-20">
          <button
            onClick={handleEditClick}
            aria-label="Edit"
            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-md shadow-lg transition-all border border-green-500"
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
            onClick={handleDeleteClick}
            aria-label="Delete"
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md shadow-lg transition-all border border-red-400"
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
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
        title="Delete Print Media Archive"
        message={`Are you sure you want to delete "${printMedia.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
};

export default PrintMediaCard;
