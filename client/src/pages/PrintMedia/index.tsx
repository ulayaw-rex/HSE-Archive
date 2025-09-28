import React, { useState, useEffect, useCallback } from "react";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PDFViewerModal from "../../components/common/PDFViewerModal";
import type { PrintMedia } from "../../types/PrintMedia";

const ITEMS_PER_PAGE = 12;
const TYPES = ["All", "Tabloids", "Magazines", "Folios", "Others"];

const PrintMediaPage: React.FC = () => {
  const [printMediaList, setPrintMediaList] = useState<PrintMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<PrintMedia | null>(null);

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
    (item) => activeType === "All" || item.type === activeType.slice(0, -1) // Match "Folios" to "Folio"
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
          <nav className="flex space-x-8" aria-label="Tabs">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                  ${
                    activeType === type
                      ? "border-green-600 text-green-600"
                      : "border-transparent text-gray-400 hover:text-green-600"
                  }
                `}
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
              {currentItems.map((item) => (
                <div
                  key={item.print_media_id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedMedia(item)}
                >
                  {/* --- THIS IS THE FIX --- */}
                  {/* Use a simple img tag with the thumbnail_url */}
                  <div className="aspect-w-3 aspect-h-4 bg-gray-200 flex items-center justify-center">
                    {item.thumbnail_url ? (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // Fallback icon if no thumbnail exists
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
                  {/* --- END OF FIX --- */}
                  <div className="p-4">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mb-2">
                      {item.type}
                    </span>
                    <h3 className="text-lg font-semibold mb-2 truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2 h-10">
                      {item.description}
                    </p>
                    <span className="text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                {Array.from({ length: pageCount }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`
                      px-4 py-2 transition-colors duration-200 rounded-md
                      ${
                        currentPage === index + 1
                          ? "bg-green-600 text-white font-semibold"
                          : "bg-transparent text-gray-500 hover:text-green-600 hover:bg-green-50"
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
              </nav>
            </div>
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
