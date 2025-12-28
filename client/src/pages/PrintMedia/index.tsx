import React, { useState, useEffect, useCallback, useMemo } from "react";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PDFViewerModal from "../../components/common/PDFViewerModal";
import { FaSearch, FaCalendarAlt, FaFilter } from "react-icons/fa";
import type { PrintMedia } from "../../types/PrintMedia";
import "../../App.css";

const ITEMS_PER_PAGE = 12;
const TYPES = ["All", "Tabloids", "Magazines", "Folios", "Others"];

// 1. Color Helper (Matches Admin PrintMediaCard)
const getCategoryColor = (type: string) => {
  const lowerType = type.toLowerCase();
  switch (lowerType) {
    case "magazine":
      return "bg-blue-600";
    case "tabloid":
      return "bg-orange-500";
    case "folio":
      return "bg-purple-600";
    case "newsletter":
      return "bg-teal-600";
    default:
      return "bg-gray-600";
  }
};

const PrintMediaPage: React.FC = () => {
  const [printMediaList, setPrintMediaList] = useState<PrintMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeType, setActiveType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<PrintMedia | null>(null);

  const fetchPrintMedia = useCallback(async () => {
    try {
      const response = await AxiosInstance.get<PrintMedia[]>("/print-media");
      setPrintMediaList(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch print media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPrintMedia();
  }, [fetchPrintMedia]);

  const availableYears = useMemo(() => {
    const years = new Set(
      printMediaList.map((item) => {
        const dateStr =
          item.date_published || item.created_at || new Date().toISOString();
        return new Date(dateStr).getFullYear().toString();
      })
    );
    return ["All", ...Array.from(years).sort((a, b) => b.localeCompare(a))];
  }, [printMediaList]);

  const filteredMedia = useMemo(() => {
    return printMediaList.filter((item) => {
      const itemDateStr =
        item.date_published || item.created_at || new Date().toISOString();
      const itemYear = new Date(itemDateStr).getFullYear().toString();

      const matchesType =
        activeType === "All" || item.type === activeType.slice(0, -1); // "Tabloids" -> "Tabloid"

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesYear = selectedYear === "All" || itemYear === selectedYear;

      return matchesType && matchesSearch && matchesYear;
    });
  }, [printMediaList, activeType, searchQuery, selectedYear]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeType, searchQuery, selectedYear]);

  const pageCount = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);
  const currentItems = filteredMedia.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 w-[90%]">
        <div className="mb-8 border-b border-gray-200 pb-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <nav
              className="flex space-x-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide"
              aria-label="Tabs"
            >
              {TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`filter-tab-btn whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeType === type
                      ? "bg-green-700 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </nav>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full sm:w-32 pl-10 pr-8 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm appearance-none bg-white cursor-pointer hover:bg-gray-50"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FaFilter className="text-xs text-gray-400" />
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search archives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          {(activeType !== "All" || selectedYear !== "All" || searchQuery) && (
            <p className="text-xs text-gray-500 italic flex items-center gap-1">
              <span className="font-semibold">Filtered by:</span>
              {activeType !== "All" && (
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  {activeType}
                </span>
              )}
              {selectedYear !== "All" && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {selectedYear}
                </span>
              )}
              {searchQuery && (
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
                  "{searchQuery}"
                </span>
              )}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {filteredMedia.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-gray-300 text-6xl mb-4">📂</div>
                <h3 className="text-xl font-medium text-gray-600">
                  No archives found
                </h3>
                <p className="text-gray-500 mt-2">
                  We couldn't find any documents matching your filters.
                </p>
                <button
                  onClick={() => {
                    setActiveType("All");
                    setSelectedYear("All");
                    setSearchQuery("");
                  }}
                  className="mt-4 text-green-600 font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentItems.map((item) => {
                  const thumbnailUrl = item.thumbnail_path
                    ? `/api/print-media/file/${item.thumbnail_path}`
                    : null;

                  const displayDate = new Date(
                    item.date_published || item.created_at
                  );

                  // 2. Get dynamic color class
                  const badgeColorClass = getCategoryColor(item.type);

                  return (
                    <div
                      key={item.print_media_id}
                      className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out group flex flex-col hover:-translate-y-1 cursor-pointer"
                      onClick={() => setSelectedMedia(item)}
                    >
                      {/* 3. Applied dynamic color to the badge */}
                      <span
                        className={`absolute top-3 left-3 z-10 inline-block px-2 py-1 text-xs font-bold rounded shadow-sm text-white uppercase tracking-wide ${badgeColorClass}`}
                      >
                        {item.type}
                      </span>

                      <span className="absolute top-3 right-3 z-10 inline-block px-2 py-1 text-xs font-bold rounded bg-white/90 text-gray-700 backdrop-blur-sm shadow-sm border border-gray-100">
                        {displayDate.getFullYear()}
                      </span>

                      <div className="h-80 bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden group-hover:bg-gray-50 transition-colors">
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10" />

                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={item.title}
                            className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="text-6xl opacity-20 mb-2">📄</span>
                            <span className="text-xs text-gray-400">
                              No Preview
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex flex-col flex-grow bg-white">
                        <h3 className="text-lg font-bold mb-2 truncate text-gray-800 group-hover:text-green-700 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2 h-10 leading-relaxed">
                          {item.description || "No description available."}
                        </p>
                        <div className="mt-auto flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                          <span className="text-gray-400 font-medium">
                            {displayDate.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                            READ NOW →
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {pageCount > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2 bg-gray-50 p-2 rounded-full shadow-inner">
                  {Array.from({ length: pageCount }).map((_, index) => {
                    const pageNumber = index + 1;
                    const isActive = currentPage === pageNumber;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-green-700 text-white shadow-md scale-110"
                            : "text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </>
        )}
      </div>

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
