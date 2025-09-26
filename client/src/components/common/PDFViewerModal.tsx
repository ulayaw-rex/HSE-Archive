import React from "react";
import { Dialog } from "@headlessui/react";
import type { PrintMedia } from "../../types/PrintMedia";

export interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  printMedia: PrintMedia | null;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  printMedia,
}) => {
  if (!printMedia) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Centered panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <Dialog.Title className="text-lg font-semibold">
              {printMedia.title}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="relative w-full h-[calc(90vh-8rem)]">
            <iframe
              src={`${printMedia.file_url}#toolbar=0`}
              className="absolute inset-0 w-full h-full"
              title={printMedia.title}
              onError={(e) => {
                console.error("PDF loading error:", e);
                e.currentTarget.classList.add("hidden");
              }}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PDFViewerModal;
