import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import type { PrintMedia } from "../../types/PrintMedia";
import { Document, Page, pdfjs } from "react-pdf";

// This is the crucial line that points to your local worker file
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

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
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  if (!printMedia) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl h-[90vh] bg-gray-100 rounded-lg shadow-lg flex flex-col">
          <div className="flex justify-between items-center px-4 py-2 border-b bg-white rounded-t-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              {printMedia.title}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              &times;
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            <Document
              file={printMedia.file_url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="p-4 text-center">Loading PDF...</div>}
              error={
                <div className="p-4 text-center text-red-500">
                  Failed to load PDF. Please check the URL.
                </div>
              }
            >
              {Array.from(new Array(numPages || 0), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                  className="flex justify-center mb-4"
                />
              ))}
            </Document>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PDFViewerModal;
