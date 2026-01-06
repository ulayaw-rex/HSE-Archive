import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PrintMedia } from "../../types/PrintMedia";
import {
  FaTimes,
  FaBook,
  FaFileAlt,
  FaSearchMinus,
  FaSearchPlus,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import LoadingSpinner from "./LoadingSpinner";

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

  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isBookMode, setIsBookMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPageNumber(1);
      setScale(1.0);
      setIsBookMode(false);
    }
  }, [isOpen, printMedia]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPage = prevPageNumber + (isBookMode ? offset * 2 : offset);
      return Math.min(Math.max(1, newPage), numPages || 1);
    });
  };

  const toggleBookMode = () => {
    setIsBookMode(!isBookMode);
    setScale(isBookMode ? 1.0 : 0.7);
    setPageNumber(1);
  };

  if (!printMedia) return null;

  const fullPdfUrl = `/api/print-media/file/${printMedia.file_path}`;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-999">
      <div
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full h-full max-w-[95vw] max-h-[95vh] bg-gray-100 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-20 shrink-0">
            <div className="flex items-center gap-4 text-gray-800">
              <h2 className="text-sm sm:text-lg font-bold truncate max-w-[200px] sm:max-w-md text-green-800">
                {printMedia.title}
              </h2>
              <span className="hidden sm:inline text-xs text-gray-500 border-l border-gray-300 pl-4">
                {isBookMode
                  ? `Pages ${pageNumber}-${Math.min(
                      pageNumber + 1,
                      numPages || 0
                    )} of ${numPages || "--"}`
                  : `Page ${pageNumber} of ${numPages || "--"}`}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex bg-gray-100 border border-gray-200 rounded-lg p-1 items-center">
                <button
                  onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600 transition-all"
                  title="Zoom Out"
                >
                  <FaSearchMinus size={14} />
                </button>
                <span className="px-2 text-xs text-gray-600 min-w-[3rem] text-center font-mono font-medium">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
                  className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600 transition-all"
                  title="Zoom In"
                >
                  <FaSearchPlus size={14} />
                </button>
              </div>

              <button
                onClick={toggleBookMode}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                  isBookMode
                    ? "bg-green-100 text-green-800 border-green-200 shadow-inner"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                }`}
                title="Toggle Book View"
              >
                {isBookMode ? <FaBook /> : <FaFileAlt />}
                <span className="hidden md:inline text-sm font-medium">
                  {isBookMode ? "Book View" : "Scroll View"}
                </span>
              </button>

              <button
                onClick={onClose}
                className="ml-2 p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex justify-center bg-gray-200/50 p-4 sm:p-8 custom-scrollbar relative">
            <Document
              file={fullPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center mt-20">
                  <LoadingSpinner />
                  <span className="text-gray-500 mt-4 text-sm font-medium">
                    Loading Document...
                  </span>
                </div>
              }
              error={
                <div className="mt-10 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex flex-col items-center">
                  <p className="font-bold">Unable to load document</p>
                  <p className="text-sm mt-1">
                    Please try downloading it instead.
                  </p>
                </div>
              }
              className="flex justify-center"
            >
              {isBookMode ? (
                <div className="flex items-center justify-center gap-0 my-auto transition-all duration-300">
                  <div className="bg-white shadow-xl origin-right">
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="border-r border-gray-100"
                    />
                  </div>

                  {pageNumber + 1 <= (numPages || 0) && (
                    <div className="bg-white shadow-xl origin-left">
                      <Page
                        pageNumber={pageNumber + 1}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-6 items-center w-full">
                  {Array.from(new Array(numPages || 0), (_, index) => (
                    <div
                      key={`page_${index + 1}`}
                      className="shadow-md transition-transform hover:shadow-lg"
                    >
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        className="bg-white"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Document>

            {isBookMode && numPages && (
              <>
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => changePage(-1)}
                  className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/80 hover:bg-white text-gray-800 shadow-lg rounded-full disabled:opacity-0 transition-all z-30 border border-gray-200 backdrop-blur-sm"
                >
                  <FaChevronLeft size={20} />
                </button>
                <button
                  disabled={pageNumber >= numPages}
                  onClick={() => changePage(1)}
                  className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/80 hover:bg-white text-gray-800 shadow-lg rounded-full disabled:opacity-0 transition-all z-30 border border-gray-200 backdrop-blur-sm"
                >
                  <FaChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default PDFViewerModal;
