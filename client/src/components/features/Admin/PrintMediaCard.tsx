import React, { useState } from "react";
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

  const openConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConfirmOpen(true);
  };

  const closeConfirm = () => setIsConfirmOpen(false);

  const confirmDelete = () => {
    onDelete(printMedia.print_media_id);
    setIsConfirmOpen(false);
  };

  return (
    <>
      <div
        className="relative rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg text-gray-900"
        style={{
          backgroundImage: printMedia.file_path
            ? `url(${printMedia.file_path})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "150px",
        }}
        onClick={() => onView(printMedia)}
      >
        <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm"></div>
        <div className="relative p-4 flex flex-col h-full justify-between">
          <div>
            <span className="inline-block bg-blue-200 text-blue-800 text-xs font-semibold uppercase rounded-full px-3 py-1 mb-2">
              {printMedia.type}
            </span>
            <h3 className="text-lg font-semibold mb-1">{printMedia.title}</h3>
            <p className="text-sm text-gray-700 mb-1">{printMedia.byline}</p>
            <p className="text-sm text-gray-700">
              {new Date(printMedia.date).toLocaleDateString()}
            </p>
          </div>
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(printMedia);
              }}
              aria-label="Edit"
              className="bg-green-100 text-green-600 p-1 rounded-md text-sm font-medium hover:bg-green-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20h9"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
                />
              </svg>
            </button>
            <button
              onClick={openConfirm}
              aria-label="Delete"
              className="bg-red-200 text-red-700 p-1 rounded-md text-sm font-medium hover:bg-red-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
                />
              </svg>
            </button>
          </div>
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
