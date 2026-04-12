import React, { useState, useEffect, useCallback, useRef } from "react";
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

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPageNumber(1);
      setScale(1.0);
      setIsBookMode(false);

      setTimeout(() => scrollContainerRef.current?.focus(), 100);
    }
  }, [isOpen, printMedia]);

  // Track which page is visible during Scroll View
  useEffect(() => {
    if (!isOpen || isBookMode || !numPages) return;

    // Clean up previous observer
    observerRef.current?.disconnect();

    const visiblePages = new Map<number, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const page = Number((entry.target as HTMLElement).dataset.pageNumber);
          if (entry.isIntersecting) {
            visiblePages.set(page, entry.intersectionRatio);
          } else {
            visiblePages.delete(page);
          }
        });

        // Pick the most-visible page (or the smallest page number if tied)
        if (visiblePages.size > 0) {
          let bestPage = 1;
          let bestRatio = 0;
          visiblePages.forEach((ratio, page) => {
            if (ratio > bestRatio || (ratio === bestRatio && page < bestPage)) {
              bestRatio = ratio;
              bestPage = page;
            }
          });
          setPageNumber(bestPage);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    pageRefs.current.forEach((el) => {
      observerRef.current!.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isOpen, isBookMode, numPages, scale]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const changePage = useCallback(
    (offset: number) => {
      setPageNumber((prevPageNumber) => {
        const newPage = prevPageNumber + (isBookMode ? offset * 2 : offset);
        return Math.min(Math.max(1, newPage), numPages || 1);
      });
    },
    [isBookMode, numPages],
  );

  const toggleBookMode = () => {
    setIsBookMode(!isBookMode);
    setScale(isBookMode ? 1.0 : 0.7);
    setPageNumber(1);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBookMode) {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          changePage(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          changePage(1);
        }
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollContainerRef.current?.scrollBy({ top: -100, behavior: "auto" });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollContainerRef.current?.scrollBy({ top: 100, behavior: "auto" });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isBookMode, changePage]);

  if (!printMedia) return null;

  const fullPdfUrl = `/api/print-media/file/${printMedia.file_path}`;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[9999]">
      <div
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full h-full max-w-[95vw] max-h-[95vh] bg-gray-100 dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 shadow-sm z-20 shrink-0 transition-colors">
            <div className="flex items-center gap-4 text-gray-800 dark:text-gray-100 transition-colors">
              <h2 className="text-sm sm:text-lg font-bold truncate max-w-[200px] sm:max-w-md text-green-800 dark:text-green-400">
                {printMedia.title}
              </h2>
              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-4 transition-colors">
                {isBookMode
                  ? `Pages ${pageNumber}-${Math.min(
                      pageNumber + 1,
                      numPages || 0,
                    )} of ${numPages || "--"}`
                  : `Page ${pageNumber} of ${numPages || "--"}`}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 items-center transition-colors">
                <button
                  onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded text-gray-600 dark:text-gray-400 transition-all"
                  title="Zoom Out"
                >
                  <FaSearchMinus size={14} />
                </button>
                <span className="px-2 text-xs text-gray-600 dark:text-gray-400 min-w-[3rem] text-center font-mono font-medium transition-colors">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
                  className="p-1.5 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm rounded text-gray-600 dark:text-gray-400 transition-all"
                  title="Zoom In"
                >
                  <FaSearchPlus size={14} />
                </button>
              </div>

              <button
                onClick={toggleBookMode}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                  isBookMode
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 shadow-inner"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition-colors"
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
                className="ml-2 p-2 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            tabIndex={0}
            className="flex-1 overflow-auto flex justify-center bg-gray-200/50 dark:bg-gray-900 p-4 sm:p-8 custom-scrollbar relative outline-none transition-colors"
          >
            <Document
              file={fullPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center mt-20">
                  <LoadingSpinner />
                  <span className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium transition-colors">
                    Loading Document...
                  </span>
                </div>
              }
              error={
                <div className="mt-10 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex flex-col items-center transition-colors">
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
                  <div className="bg-white dark:bg-gray-900 shadow-xl origin-right transition-colors">
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="border-r border-gray-100 dark:border-gray-700 transition-colors"
                    />
                  </div>

                  {pageNumber + 1 <= (numPages || 0) && (
                    <div className="bg-white dark:bg-gray-900 shadow-xl origin-left transition-colors">
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
                      data-page-number={index + 1}
                      ref={(el) => {
                        if (el) {
                          pageRefs.current.set(index + 1, el);
                        } else {
                          pageRefs.current.delete(index + 1);
                        }
                      }}
                      className="shadow-md transition-transform hover:shadow-lg"
                    >
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        className="bg-white dark:bg-gray-900 transition-colors"
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
                  className="fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg rounded-full disabled:opacity-0 transition-all z-30 border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                >
                  <FaChevronLeft size={20} />
                </button>
                <button
                  disabled={pageNumber >= numPages}
                  onClick={() => changePage(1)}
                  className="fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg rounded-full disabled:opacity-0 transition-all z-30 border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
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
