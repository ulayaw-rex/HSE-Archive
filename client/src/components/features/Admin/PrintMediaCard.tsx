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

  // --- LINTER FIX ---
  // Wrapped functions in useCallback with proper dependency arrays.
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
          className="rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-xl transition-shadow duration-300 text-gray-900 block"
          style={{
            backgroundImage: printMedia.thumbnail_url
              ? `url(${printMedia.thumbnail_url})`
              : undefined,
            backgroundColor: "#cccccc",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "250px",
          }}
          onClick={handleCardClick}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
          <div className="relative p-4 flex flex-col h-full justify-between text-white">
            <div className="flex-grow">
              <span className="inline-block bg-blue-200 text-blue-800 text-xs font-semibold uppercase rounded-full px-3 py-1 mb-2">
                {printMedia.type}
              </span>
              <h3 className="text-xl font-bold mb-1 drop-shadow-md">
                {printMedia.title}
              </h3>
              <p className="text-sm text-gray-200 drop-shadow">
                {printMedia.byline}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-300">
                {new Date(printMedia.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute top-2 right-2 flex space-x-2 z-10">
          <button
            onClick={handleEditClick}
            aria-label="Edit"
            className="bg-green-500 text-white p-2 rounded-full shadow-lg opacity-70 hover:opacity-100 transition-opacity"
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
            className="bg-red-500 text-white p-2 rounded-full shadow-lg opacity-70 hover:opacity-100 transition-opacity"
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
