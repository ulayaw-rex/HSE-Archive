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
      <div className="relative">
        <div
          className="rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-300 relative bg-gray-300"
          style={{ minHeight: "250px" }}
          onClick={handleCardClick}
        >
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={printMedia.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>

          <div className="relative p-4 flex flex-col h-full text-white">
            <div className="flex-grow"></div>

            <div>
              <span className="inline-block bg-black text-white text-xs font-semibold uppercase rounded-full px-3 py-1 mb-2">
                {printMedia.type}
              </span>
              <h3 className="mt-25 text-xl font-bold mb-1 drop-shadow-md">
                {printMedia.title}
              </h3>
              <p className="text-sm text-gray-200 drop-shadow mb-2">
                {printMedia.byline}
              </p>{" "}
            </div>
          </div>
        </div>

        <div className="absolute top-2 right-2 flex space-x-2 z-10">
          <button
            onClick={handleEditClick}
            aria-label="Edit"
            className="print-media-edit-btn print-media-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
            className="print-media-delete-btn print-media-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
