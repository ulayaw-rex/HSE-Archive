import React, { useState, useEffect, useCallback } from "react";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PDFViewerModal from "../../components/common/PDFViewerModal";
import type { PrintMedia } from "../../types/PrintMedia";
import "../../App.css";

const ITEMS_PER_PAGE = 12;
const TYPES = ["All", "Tabloids", "Magazines", "Folios", "Others"];

const PrintMediaPage: React.FC = () => {
  const [printMediaList, setPrintMediaList] = useState<PrintMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<PrintMedia | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const fetchPrintMedia = useCallback(async () => {
    try {
      const response = await AxiosInstance.get<PrintMedia[]>("/print-media");
      setPrintMediaList(response.data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Failed to fetch print media:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPrintMedia();
  }, [fetchPrintMedia]);

  const filteredMedia = printMediaList.filter(
    (item) => activeType === "All" || item.type === activeType.slice(0, -1)
  );

  const pageCount = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);
  const currentItems = filteredMedia.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        {/* Filter Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-4" aria-label="Tabs">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`filter-tab-btn ${
                  activeType === type ? "active" : ""
                }`}
              >
                {type}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentItems.map((item) => {
                const thumbnailUrl = item.thumbnail_path
                  ? `${apiBaseUrl}/api/print-media/file/${item.thumbnail_path}`
                  : null;

                return (
                  <div
                    key={item.print_media_id}
                    className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out group flex flex-col hover:scale-105"
                    onClick={() => setSelectedMedia(item)}
                  >
                    <span className="absolute top-3 left-3 z-10 inline-block px-2 py-1 text-xs font-semibold rounded-full bg-black text-white">
                      {item.type}
                    </span>

                    <div className="h-80 bg-gray-100 flex items-center justify-center p-4">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-contain drop-shadow-md"
                        />
                      ) : (
                        <svg
                          className="w-16 h-16 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                          <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <h3 className="text-lg font-semibold mb-2 truncate group-hover:text-green-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2 h-10">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                {Array.from({ length: pageCount }).map((_, index) => {
                  const pageNumber = index + 1;
                  const isActive = currentPage === pageNumber;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`pagination-btn ${isActive ? "active" : ""}`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </nav>
            </div>{" "}
          </>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedMedia && (
        <PDFViewerModal
          isOpen={true}
          onClose={() => setSelectedMedia(null)}
          printMedia={selectedMedia}
        />
      )}
    </div>
  );
};

export default PrintMediaPage;
