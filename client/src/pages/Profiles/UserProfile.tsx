import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PublicationCard from "../../components/features/Admin/PublicationCard";
import PublicationForm from "../../components/features/Publications/PublicationForm";
import PDFViewerModal from "../../components/common/PDFViewerModal";
import PublicationViewModal from "../../components/features/Admin/PublicationViewModal";

import {
  FaPenNib,
  FaCheckDouble,
  FaNewspaper,
  FaClock,
  FaExclamationCircle,
  FaUserSlash,
  FaBookOpen,
  FaFileDownload,
  FaUserGraduate,
} from "react-icons/fa";
import type { User } from "../../types/User";
import type { PrintMedia } from "../../types/PrintMedia";

interface UserProfileData extends User {
  position?: string;
  course?: string;
  avatar?: string;
}

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
      return "bg-green-600";
    default:
      return "bg-gray-600";
  }
};

const UserProfile: React.FC = () => {
  const { userId: paramId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();

  const targetUserId = paramId ? parseInt(paramId) : currentUser?.id;

  const [profileUser, setProfileUser] = useState<UserProfileData | null>(null);
  const [publications, setPublications] = useState<any[]>([]);
  const [printMedia, setPrintMedia] = useState<PrintMedia[]>([]);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "portfolio" | "workbench" | "queue"
  >("portfolio");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPub, setEditingPub] = useState<any | null>(null);
  const [selectedPrintMedia, setSelectedPrintMedia] =
    useState<PrintMedia | null>(null);
  const [viewingArticle, setViewingArticle] = useState<any | null>(null);

  const isOwnProfile =
    currentUser &&
    targetUserId &&
    Number(currentUser.id) === Number(targetUserId);
  const isAlumni = profileUser?.role === "alumni";

  const userPosition = (currentUser?.position || "").toLowerCase();
  const isAdmin = currentUser?.role === "admin";
  const isEIC = userPosition.includes("editor-in-chief");
  const isAssociate = userPosition.includes("associate editor");
  const isManagement =
    isAdmin || isEIC || isAssociate || userPosition.includes("director");

  const canDownload = isOwnProfile || isAdmin;

  const fetchProfileData = async (isPolling = false) => {
    if (!targetUserId) return;
    try {
      if (!isPolling && !profileUser) setLoading(true);

      const res = await AxiosInstance.get(`/users/${targetUserId}/profile`);

      setProfileUser(res.data.user);
      setPublications(res.data.articles || []);
      setPrintMedia(res.data.print_media || []);
      setReviewQueue(res.data.review_queue || []);
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();

    const intervalId = setInterval(() => {
      fetchProfileData(true);
    }, 10000);

    return () => clearInterval(intervalId);
  }, [targetUserId]);

  const { portfolio, workbench } = useMemo(() => {
    if (!publications) return { portfolio: [], workbench: [] };
    const pf = publications.filter((p) => p.status === "published");
    const wb = publications.filter((p) =>
      ["draft", "submitted", "returned", "reviewed", "approved"].includes(
        p.status,
      ),
    );
    return { portfolio: pf, workbench: wb };
  }, [publications]);

  const handleCreateClick = () => {
    setEditingPub(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (pub: any) => {
    setEditingPub(pub);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await AxiosInstance.delete(`/publications/${id}`);
      fetchProfileData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormSuccess = () => {
    fetchProfileData();
  };

  const isPdf = (filePath?: string) => filePath?.toLowerCase().endsWith(".pdf");

  const handleMediaClick = (item: PrintMedia) => {
    if (!canDownload || isPdf(item.file_path)) {
      setSelectedPrintMedia(item);
    } else {
      const url = `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/print-media/${item.print_media_id}/download`;
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex flex-col items-center justify-start">
        <div className="scale-150 mb-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 -mt-20">
        <div className="text-center">
          <FaUserSlash className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">
            Profile Not Found
          </h2>
          <Link to="/" className="text-green-600 mt-4 block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="container mx-auto px-4 pt-10">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
          <div className="relative flex-shrink-0">
            <div
              className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-4xl text-white font-bold shadow-md overflow-hidden ${isAlumni ? "bg-purple-900 border-purple-100" : "bg-green-900 border-white"}`}
            >
              {profileUser.avatar ? (
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profileUser.name?.charAt(0) || "U"
              )}
            </div>
            {isAlumni && (
              <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full border-4 border-white shadow-md">
                <FaUserGraduate size={20} />
              </div>
            )}
          </div>

          <div className="flex-grow text-center md:text-left mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {profileUser.name || "Unknown User"}
            </h1>
            <p className="text-gray-500 font-medium">{profileUser.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full uppercase tracking-wide ${isAlumni ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"}`}
              >
                {profileUser.position || "Member"}
              </span>
              {isAlumni && (
                <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
                  Alumni
                </span>
              )}
            </div>
          </div>

          {isOwnProfile && (
            <button
              onClick={handleCreateClick}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold shadow-md transition-all flex items-center gap-2"
            >
              <FaPenNib /> Write Article
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm min-h-[500px]">
              <div className="flex border-b border-gray-200 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`flex-1 min-w-[150px] py-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === "portfolio" ? "border-b-4 border-green-600 text-green-700 bg-green-50" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaNewspaper /> Portfolio ({portfolio.length})
                  </div>
                </button>
                {isOwnProfile && (
                  <button
                    onClick={() => setActiveTab("workbench")}
                    className={`flex-1 min-w-[150px] py-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === "workbench" ? "border-b-4 border-blue-600 text-blue-700 bg-blue-50" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaClock /> Workbench ({workbench.length})
                    </div>
                  </button>
                )}
                {isOwnProfile && isManagement && (
                  <button
                    onClick={() => setActiveTab("queue")}
                    className={`flex-1 min-w-[150px] py-4 text-center font-bold text-sm uppercase tracking-wider transition-colors ${activeTab === "queue" ? "border-b-4 border-red-600 text-red-700 bg-red-50" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaCheckDouble /> Review ({reviewQueue.length})
                    </div>
                  </button>
                )}
              </div>

              <div className="p-6">
                {activeTab === "portfolio" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolio.length > 0 ? (
                      portfolio.map((pub) => (
                        <div
                          key={pub.publication_id}
                          onClick={() => setViewingArticle(pub)}
                          className="cursor-pointer"
                        >
                          <PublicationCard
                            publication={pub}
                            readOnly={true}
                            onStatusChange={fetchProfileData}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20 text-gray-400">
                        <FaNewspaper className="mx-auto text-4xl mb-3 opacity-30" />{" "}
                        No published articles.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "workbench" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {workbench.length > 0 ? (
                      workbench.map((pub) => (
                        <PublicationCard
                          key={pub.publication_id}
                          publication={pub}
                          onEdit={handleEditClick}
                          onDelete={handleDeleteClick}
                          onStatusChange={fetchProfileData}
                          onClick={() => setViewingArticle(pub)}
                        />
                      ))
                    ) : (
                      <div className="col-span-full text-center py-20 text-gray-400">
                        <FaClock className="mx-auto text-4xl mb-3 opacity-30" />{" "}
                        Your workbench is empty.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "queue" && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 flex items-center rounded-lg">
                      <FaExclamationCircle className="h-5 w-5 text-yellow-400 mr-3" />
                      <p className="text-sm text-yellow-700">
                        You have <strong>{reviewQueue.length}</strong> articles
                        waiting for action.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reviewQueue.map((pub) => (
                        <PublicationCard
                          key={pub.publication_id}
                          publication={pub}
                          isManagementView={true}
                          onStatusChange={fetchProfileData}
                          onClick={() => setViewingArticle(pub)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
              <div
                className={`py-3 px-4 ${isAlumni ? "bg-purple-800" : "bg-green-800"}`}
              >
                <h3 className="text-white font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                  <FaBookOpen /> Collection
                </h3>
              </div>
              <div className="p-4 min-h-[300px] flex flex-col items-center justify-start text-center">
                {printMedia.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {printMedia.map((item, idx) => {
                      const badgeColor = getCategoryColor(item.type);
                      const fileIsPdf = isPdf(item.file_path);
                      const thumbnailUrl = item.thumbnail_path
                        ? `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${item.thumbnail_path}`
                        : null;
                      const showAsRead = !canDownload || fileIsPdf;

                      return (
                        <div
                          key={idx}
                          onClick={() => handleMediaClick(item)}
                          className="group relative block bg-gray-900 rounded-r-md shadow-md transition-all duration-300 overflow-hidden aspect-[3/4] cursor-pointer hover:shadow-2xl hover:scale-105"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-white/30 to-transparent z-10 h-full"></div>
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 p-2 text-center border-l-4 border-white/10">
                              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
                                <FaBookOpen className="text-white/50" />
                              </div>
                              <span className="text-white font-serif text-[10px] font-bold leading-tight line-clamp-3">
                                {item.title}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-1 left-2 z-20">
                            <span
                              className={`${badgeColor} text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm`}
                            >
                              {item.type}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20">
                            <div className="bg-white text-gray-800 p-2 rounded-full shadow-lg mb-2">
                              {showAsRead ? (
                                <FaBookOpen size={14} />
                              ) : (
                                <FaFileDownload size={14} />
                              )}
                            </div>
                            <span className="text-white text-[10px] font-bold uppercase tracking-wider border border-white px-2 py-1 rounded-sm">
                              {showAsRead ? "Read" : "Download"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-400 py-10">
                    <div className="bg-gray-100 p-4 rounded-full inline-block mb-3">
                      <FaBookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm">No print media found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <PublicationForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          publicationToEdit={editingPub}
        />
        {viewingArticle && (
          <PublicationViewModal
            isOpen={!!viewingArticle}
            onClose={() => setViewingArticle(null)}
            publication={viewingArticle}
          />
        )}
        {selectedPrintMedia && (
          <PDFViewerModal
            isOpen={true}
            onClose={() => setSelectedPrintMedia(null)}
            printMedia={selectedPrintMedia}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
