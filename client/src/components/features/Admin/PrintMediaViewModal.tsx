import React from "react";
import type { PrintMedia } from "../../../types/PrintMedia";

interface PrintMediaViewModalProps {
  printMedia: PrintMedia;
  isOpen: boolean;
  onClose: () => void;
}

const PrintMediaViewModal: React.FC<PrintMediaViewModalProps> = ({
  printMedia,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !printMedia) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container max-w-3xl p-6 bg-white rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4">{printMedia.title}</h2>
        <p className="mb-2">
          <strong>Type:</strong> {printMedia.type}
        </p>
        <p className="mb-2">
          <strong>Date:</strong>{" "}
          {new Date(printMedia.date).toLocaleDateString()}
        </p>
        <p className="mb-4 whitespace-pre-wrap">{printMedia.description}</p>
        {printMedia.file_path && (
          <a
            href={printMedia.file_path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Attached File
          </a>
        )}
      </div>
    </div>
  );
};

export default PrintMediaViewModal;
