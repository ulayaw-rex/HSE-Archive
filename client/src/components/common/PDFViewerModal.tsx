import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import type { PrintMedia } from "../../types/PrintMedia";
import { Document, Page, pdfjs } from "react-pdf";

// Set up PDF.js worker with matching version
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

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
    console.log("PDF loaded successfully with", numPages, "pages");
    setNumPages(numPages);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF load error:", error);
    console.error("PDF URL:", fullPdfUrl);
  }

  if (!printMedia) return null;

  // Use the proxy from vite.config.ts instead of direct API URL
  const fullPdfUrl = `/api/print-media/file/${printMedia.file_path}`;

  // Debug logging (can be removed in production)
  console.log("PDF Modal - File path:", printMedia.file_path);
  console.log("PDF Modal - Full URL:", fullPdfUrl);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-4xl h-[90vh] bg-gray-100 rounded-lg shadow-lg flex flex-col">
          <div className="flex justify-between items-center px-4 py-2 border-b bg-white rounded-t-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-800">
              {printMedia.title}
            </Dialog.Title>
          </div>
          <div className="flex-grow overflow-y-auto">
            <Document
              file={fullPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<div className="p-4 text-center">Loading PDF...</div>}
              error={
                <div className="p-4 text-center text-red-500">
                  <p>Failed to load PDF. Please check the URL.</p>
                  <p className="text-sm mt-2">URL: {fullPdfUrl}</p>
                  <p className="text-sm">File path: {printMedia.file_path}</p>
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
