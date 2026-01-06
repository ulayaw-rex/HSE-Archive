import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaPlus,
  FaBookOpen,
  FaFileDownload,
  FaUserGraduate,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type {
  Publication,
  CreatePublicationData,
} from "../../types/Publication";
import type { PrintMedia } from "../../types/PrintMedia";
import { useAuth } from "../../context/AuthContext";
// Removed react-toastify import
import PublicationForm from "../../components/features/Publications/PublicationForm";
import PublicationViewModal from "../../components/features/Admin/PublicationViewModal";
import PDFViewerModal from "../../components/common/PDFViewerModal";

const getCategoryColor = (type: string) => {
  const lowerType = type.toLowerCase();
  switch (lowerType) {
    case "magazine":
      return "bg-blue-600";
    case "tabloid":
      return "bg-orange-500";
    case "folio":
      return "bg-purple-600";
    default:
      return "bg-gray-600";
  }
};

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  course?: string;
  position?: string;
  avatar?: string;
}

interface ExtendedCreatePublicationData extends CreatePublicationData {
  writer_ids: number[];
}

const UserProfile: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [articles, setArticles] = useState<Publication[]>([]);
  const [printMedia, setPrintMedia] = useState<PrintMedia[]>([]);
  const [selectedPrintMedia, setSelectedPrintMedia] =
    useState<PrintMedia | null>(null);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingArticle, setViewingArticle] = useState<Publication | null>(
    null
  );

  // --- MODAL STATE ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("Something went wrong.");

  const targetId = id || currentUser?.id;

  useEffect(() => {
    if (!targetId) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const endpoint = id ? `/profile/${id}` : "/profile";
        const response = await AxiosInstance.get(endpoint);

        setProfile(response.data.user);
        setArticles(response.data.articles);
        // This will now display authored print media if the backend returns it
        setPrintMedia(response.data.print_media || []);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetId, id]);

  const handleSubmit = async (data: ExtendedCreatePublicationData) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("body", data.body);
      formData.append("category", data.category);
      formData.append("byline", data.byline);
      if (data.photo_credits)
        formData.append("photo_credits", data.photo_credits);
      if (data.image instanceof File) formData.append("image", data.image);
      if (data.writer_ids && data.writer_ids.length > 0) {
        data.writer_ids.forEach((id) =>
          formData.append("writer_ids[]", id.toString())
        );
      }

      const response = await AxiosInstance.post("/publications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setArticles([response.data, ...articles]);
      setIsModalOpen(false);
      setShowSuccessModal(true); // Show Success Modal
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || "Failed to submit article"
      );
      setShowErrorModal(true); // Show Error Modal
    }
  };

  const isPdf = (filePath?: string) => filePath?.toLowerCase().endsWith(".pdf");

  const handleMediaClick = (item: PrintMedia) => {
    if (isPdf(item.file_path)) {
      setSelectedPrintMedia(item);
    } else {
      const url = `/api/print-media/${item.print_media_id}/download`;
      window.open(url, "_blank");
      // Toast removed; browser UI handles download feedback
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium bg-gray-50">
        User not found.
      </div>
    );

  const isOwnProfile = currentUser?.id === profile.id;
  const canSubmitArticle = isOwnProfile && currentUser?.role !== "alumni";
  const isAlumni = profile.role === "alumni";

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* --- SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSuccessModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <FaCheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Article submitted successfully! It is now pending approval.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-200 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* --- ERROR MODAL --- */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowErrorModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <FaExclamationCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Submission Failed
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-200 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            <div className="flex-shrink-0 relative">
              <div
                className={`w-28 h-28 md:w-40 md:h-40 rounded-full border-4 overflow-hidden flex items-center justify-center shadow-lg ${
                  isAlumni
                    ? "border-purple-100 bg-purple-900"
                    : "border-green-100 bg-green-800"
                }`}
              >
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl md:text-5xl font-bold text-white uppercase">
                    {profile.name.charAt(0)}
                  </span>
                )}
              </div>

              {isAlumni && (
                <div
                  className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-full border-4 border-white shadow-md"
                  title="Alumni Member"
                >
                  <FaUserGraduate size={20} />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left pt-2">
              {isAlumni && (
                <span className="inline-block px-3 py-1 mb-2 text-xs font-extrabold tracking-widest text-purple-700 bg-purple-100 rounded-full uppercase">
                  Alumni Member
                </span>
              )}

              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 break-words">
                {profile.name}
              </h1>
              <p className="text-gray-500 font-medium mt-1 text-sm md:text-base break-all">
                ({profile.email})
              </p>
              <div className="mt-3 space-y-1">
                <p className="text-base md:text-lg text-gray-700 font-semibold uppercase tracking-wide">
                  {profile.course || "No Course Listed"}
                </p>
                <p
                  className={`text-lg md:text-xl font-bold ${
                    isAlumni ? "text-purple-700" : "text-green-700"
                  }`}
                >
                  {profile.position || "Member"}
                </p>
              </div>

              {canSubmitArticle && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-6 py-2 bg-green-800 text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-md transform hover:scale-105 text-sm md:text-base"
                  >
                    <FaPlus className="mr-2" /> Submit article
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-2 mb-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-wide">
                Online Articles
              </h2>
              <span className="text-gray-500 text-xs md:text-sm font-medium">
                {articles.length} Published
              </span>
            </div>

            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <div
                    key={article.publication_id}
                    onClick={() => setViewingArticle(article)}
                    className="group bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full relative cursor-pointer"
                  >
                    {article.status === "pending" && (
                      <div className="absolute top-2 right-2 z-10 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                        Pending
                      </div>
                    )}
                    <div className="h-48 bg-gray-200 overflow-hidden relative">
                      {article.image ? (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                          <span className="text-4xl opacity-20">📰</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
                        {article.title}
                      </h3>
                      <div className="mt-auto pt-4 flex justify-between items-center text-xs text-gray-500">
                        <span>
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-green-600 font-semibold cursor-pointer">
                          Read
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg border border-dashed border-gray-300 text-center">
                <p className="text-gray-500">No articles published yet.</p>
              </div>
            )}
          </div>

          <div className="w-full">
            <div
              className={`text-white p-1 rounded-t-md ${
                isAlumni ? "bg-purple-800" : "bg-green-800"
              }`}
            >
              <h3 className="text-center font-bold py-2 uppercase tracking-wider text-sm md:text-base">
                Collection
              </h3>
            </div>

            <div className="bg-white border border-gray-200 p-4 rounded-b-md shadow-sm mb-6 overflow-hidden">
              {printMedia.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar p-1">
                  {printMedia.map((media) => {
                    const thumbnailUrl = media.thumbnail_path
                      ? `/api/print-media/file/${media.thumbnail_path}`
                      : null;
                    const badgeColor = getCategoryColor(media.type);
                    const fileIsPdf = isPdf(media.file_path);

                    return (
                      <div
                        key={media.print_media_id}
                        className="group cursor-pointer flex flex-col"
                        onClick={() => handleMediaClick(media)}
                      >
                        <div className="relative aspect-[3/4] bg-gray-100 rounded-r shadow-md border-l-4 border-gray-800/20 overflow-hidden group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                          {thumbnailUrl ? (
                            <img
                              src={thumbnailUrl}
                              alt={media.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50 p-2 text-center">
                              <span className="text-2xl mb-1 opacity-50">
                                📓
                              </span>
                              <span className="text-[10px] font-bold uppercase">
                                {media.type}
                              </span>
                            </div>
                          )}

                          <div className="absolute top-1 left-1">
                            <span
                              className={`${badgeColor} text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-sm shadow-sm`}
                            >
                              {media.type}
                            </span>
                          </div>

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/90 text-gray-800 p-2 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                              {fileIsPdf ? (
                                <FaBookOpen size={14} />
                              ) : (
                                <FaFileDownload size={14} />
                              )}
                            </div>
                          </div>
                        </div>

                        <h4 className="mt-2 text-xs font-bold text-gray-800 leading-tight text-center line-clamp-2 group-hover:text-green-700 transition-colors">
                          {media.title}
                        </h4>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <span className="text-4xl block mb-2 opacity-20">📚</span>
                  <p className="text-gray-400 text-sm">No print media found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PublicationForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        mode="add"
        currentUser={currentUser}
      />
      <PublicationViewModal
        isOpen={!!viewingArticle}
        onClose={() => setViewingArticle(null)}
        publication={viewingArticle}
      />
      {selectedPrintMedia && (
        <PDFViewerModal
          isOpen={true}
          onClose={() => setSelectedPrintMedia(null)}
          printMedia={selectedPrintMedia}
        />
      )}
    </div>
  );
};

export default UserProfile;
