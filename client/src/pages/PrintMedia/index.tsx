import React, { useState, useEffect, useCallback, useMemo } from "react";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PDFViewerModal from "../../components/common/PDFViewerModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import {
  FaSearch,
  FaCalendarAlt,
  FaFilter,
  FaUserPlus,
  FaDownload,
  FaCheckCircle,
  FaInfoCircle,
  FaUserClock,
  FaUserCircle,
} from "react-icons/fa";
import type { PrintMedia } from "../../types/PrintMedia";
import { useDataCache } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import "../../App.css";

import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 12;
const TYPES = ["All", "Tabloids", "Magazines", "Folios", "Others"];

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cache, updateCache } = useDataCache();

  const [printMediaList, setPrintMediaList] = useState<PrintMedia[]>(
    cache.printMedia || []
  );
  const [loading, setLoading] = useState(!cache.printMedia);

  const [activeType, setActiveType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedMedia, setSelectedMedia] = useState<PrintMedia | null>(null);
  const [claimTarget, setClaimTarget] = useState<PrintMedia | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [requestingCredit, setRequestingCredit] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadySubmittedModal, setShowAlreadySubmittedModal] =
    useState(false);

  const [pendingRequestIds, setPendingRequestIds] = useState<number[]>([]);

  const fetchPrintMedia = useCallback(async () => {
    try {
      if (!cache.printMedia) setLoading(true);
      const response = await AxiosInstance.get<PrintMedia[]>("/print-media");
      setPrintMediaList(response.data);
      updateCache("printMedia", response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch print media");
    } finally {
      setLoading(false);
    }
  }, [updateCache, cache.printMedia]);

  useEffect(() => {
    void fetchPrintMedia();
  }, [fetchPrintMedia]);

  const handleClaimClick = (e: React.MouseEvent, item: PrintMedia) => {
    e.stopPropagation();
    setClaimTarget(item);
    setIsClaimModalOpen(true);
  };

  const submitClaimRequest = async () => {
    if (!claimTarget) return;

    try {
      setRequestingCredit(true);
      await AxiosInstance.post(
        `/print-media/${claimTarget.print_media_id}/request-credit`
      );
      setPendingRequestIds((prev) => [...prev, claimTarget.print_media_id]);
      setIsClaimModalOpen(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setPendingRequestIds((prev) => [...prev, claimTarget.print_media_id]);
        setIsClaimModalOpen(false);
        setShowAlreadySubmittedModal(true);
      } else if (error.response?.status === 422) {
        toast.warning("You are already listed as an owner.");
        setIsClaimModalOpen(false);
      } else {
        toast.error("Failed to send request. Please try again.");
      }
    } finally {
      setRequestingCredit(false);
    }
  };

  const isPdf = (filePath?: string) => {
    return filePath?.toLowerCase().endsWith(".pdf");
  };

  const handleDownload = async (e: React.MouseEvent, item: PrintMedia) => {
    e.stopPropagation();
    try {
      const downloadUrl = `/api/print-media/${item.print_media_id}/download`;
      window.open(downloadUrl, "_blank");
    } catch (error) {
      toast.error("Download failed.");
    }
  };

  const handleUserClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  const handleCardClick = (e: React.MouseEvent, item: PrintMedia) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if ((e.target as HTMLElement).closest(".user-link")) return;

    if (isPdf(item.file_path)) {
      setSelectedMedia(item);
    } else {
      handleDownload(e, item);
      toast.info("Downloading file (Preview not available for this format).");
    }
  };

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
        activeType === "All" || item.type === activeType.slice(0, -1);
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
      <ConfirmationModal
        isOpen={isClaimModalOpen}
        onClose={() => !requestingCredit && setIsClaimModalOpen(false)}
        onConfirm={submitClaimRequest}
        title="Claim Ownership"
        message={`Are you sure you want to claim ownership of "${claimTarget?.title}"?`}
        confirmLabel="Submit Request"
        cancelLabel="Cancel"
        isLoading={requestingCredit}
        isDangerous={false}
      />

      {showSuccessModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <FaCheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Request Sent!
            </h3>
            <p className="text-gray-500 mb-8">
              The administrator will review your claim shortly.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all"
            >
              Okay, Got it
            </button>
          </div>
        </div>
      )}

      {showAlreadySubmittedModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAlreadySubmittedModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <FaInfoCircle className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Request Pending
            </h3>
            <p className="text-gray-500 mb-8">
              You have already submitted a request for this item.
            </p>
            <button
              onClick={() => setShowAlreadySubmittedModal(false)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 w-[90%]">
        <div className="mb-8 border-b border-gray-200 pb-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <nav className="flex space-x-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
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
                  className="w-full sm:w-32 pl-10 pr-8 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm appearance-none bg-white cursor-pointer hover:bg-gray-50"
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
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
                  const badgeColorClass = getCategoryColor(item.type);
                  const isOwner =
                    user &&
                    ((item as any).user_id === user.id ||
                      user.role === "admin");
                  const isPending =
                    (item as any).has_pending_request ||
                    pendingRequestIds.includes(item.print_media_id);
                  const fileIsPdf = isPdf(item.file_path);

                  return (
                    <div
                      key={item.print_media_id}
                      className="relative bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 ease-in-out group flex flex-col hover:-translate-y-1 cursor-pointer"
                      onClick={(e) => handleCardClick(e, item)}
                    >
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

                        <div className="absolute bottom-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                          {isOwner && (
                            <button
                              onClick={(e) => handleDownload(e, item)}
                              className="bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-green-600 hover:text-white transition-colors"
                              title="Download PDF"
                            >
                              <FaDownload size={14} />
                            </button>
                          )}
                          {user && !isOwner && isPending && (
                            <button
                              disabled
                              onClick={(e) => e.stopPropagation()}
                              className="bg-gray-100 text-gray-400 p-2 rounded-full shadow-sm cursor-not-allowed border border-gray-200"
                              title="Request Pending Approval"
                            >
                              <FaUserClock size={14} />
                            </button>
                          )}
                          {user && !isOwner && !isPending && (
                            <button
                              onClick={(e) => handleClaimClick(e, item)}
                              className="bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-blue-600 hover:text-white transition-colors"
                              title="Claim Ownership"
                            >
                              <FaUserPlus size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-grow bg-white">
                        <h3 className="text-lg font-bold mb-2 truncate text-gray-800 group-hover:text-green-700 transition-colors">
                          {item.title}
                        </h3>

                        {(item as any).owner_name && (
                          <div className="flex items-center gap-2 mb-4 w-fit">
                            <div
                              className="flex items-center gap-1.5 cursor-pointer group/author"
                              onClick={(e) =>
                                handleUserClick(e, (item as any).user_id)
                              }
                            >
                              <FaUserCircle
                                className="text-gray-400 group-hover/author:text-green-600 transition-colors"
                                size={14}
                              />
                              <span className="text-xs font-semibold text-gray-600 group-hover/author:text-green-700 transition-colors">
                                {(item as any).owner_name}
                              </span>
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10 leading-relaxed">
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
                          <span
                            className={`font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300 ${
                              fileIsPdf ? "text-green-600" : "text-blue-600"
                            }`}
                          >
                            {fileIsPdf ? "READ NOW →" : "DOWNLOAD ↓"}
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
