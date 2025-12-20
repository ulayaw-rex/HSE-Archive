import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type {
  Publication,
  CreatePublicationData,
} from "../../types/Publication";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import PublicationForm from "../../components/features/Publications/PublicationForm";
import PublicationViewModal from "../../components/features/Admin/PublicationViewModal";

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
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [viewingArticle, setViewingArticle] = useState<Publication | null>(
    null
  );

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

      if (data.image instanceof File) {
        formData.append("image", data.image);
      }

      if (data.writer_ids && data.writer_ids.length > 0) {
        data.writer_ids.forEach((id) => {
          formData.append("writer_ids[]", id.toString());
        });
      }

      const response = await AxiosInstance.post("/publications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setArticles([response.data, ...articles]);
      setIsModalOpen(false);
      toast.success("Article submitted successfully!");
    } catch (error: any) {
      console.error("Submission failed:", error);
      toast.error(error.response?.data?.message || "Failed to submit article");
    }
  };

  if (loading)
    return (
      <div className="mt-20">
        <LoadingSpinner />
      </div>
    );
  if (!profile) return <div className="mt-20 text-center">User not found.</div>;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-green-100 overflow-hidden bg-green-800 flex items-center justify-center">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-white uppercase">
                    {profile.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left pt-2">
              <h1 className="text-3xl font-extrabold text-gray-900">
                {profile.name}
              </h1>
              <p className="text-gray-500 font-medium mt-1">
                ({profile.email})
              </p>

              <div className="mt-3 space-y-1">
                <p className="text-lg text-gray-700 font-semibold uppercase tracking-wide">
                  {profile.course || "No Course Listed"}
                </p>
                <p className="text-xl text-green-700 font-bold">
                  {profile.position || "Member"}
                </p>
              </div>

              {isOwnProfile && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center px-6 py-2 bg-green-800 text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-md transform hover:scale-105"
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
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                Online Articles
              </h2>
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

          <div className="hidden lg:block">
            <div className="bg-green-800 text-white p-1 rounded-t-md">
              <h3 className="text-center font-bold py-2 uppercase tracking-wider">
                Print Media
              </h3>
            </div>
            <div className="bg-white border border-gray-200 p-4 rounded-b-md shadow-sm mb-6">
              <div className="bg-gray-100 h-64 rounded flex items-center justify-center text-gray-400">
                <span>Print Media Widget</span>
              </div>
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
    </div>
  );
};

export default UserProfile;
