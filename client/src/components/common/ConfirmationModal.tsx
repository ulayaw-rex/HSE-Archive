import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean; // 1. Add isLoading to the props interface
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false, // 2. Receive the prop with a default value
}) => {
  if (!isOpen) return null;

  return (
    // 3. Disable closing via overlay click while loading
    <div className="modal-container" onClick={isLoading ? undefined : onClose}>
      <div
        className="modal-content p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <div className="my-4">
          <div className="flex items-center space-x-3 text-red-600 mb-3">
            {/* ... SVG icon ... */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-gray-600 font-medium text-sm sm:text-base">
              {message}
            </p>
          </div>
        </div>
        <div className="modal-actions">
          {/* 4. Disable the cancel button while loading */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="modal-btn modal-btn-cancel disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          {/* 5. Disable the confirm button while loading */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="modal-btn modal-btn-delete flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {/* ... SVG icon ... */}
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
            <span>{isLoading ? "Deleting..." : confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
