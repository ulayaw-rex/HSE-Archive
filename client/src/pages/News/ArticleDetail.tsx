import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserPlus,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { toast } from "react-toastify";
import type { Publication } from "../../types/Publication";
import { useAuth } from "../../context/AuthContext";
import {
  Comments,
  type Comment,
} from "../../components/features/Publications/Comments";

const getCategoryColor = (category: string) => {
  const lowerCat = category.toLowerCase();
  switch (lowerCat) {
    case "university":
      return "bg-green-600";
    case "local":
      return "bg-blue-600";
    case "national":
      return "bg-red-600";
    case "entertainment":
      return "bg-purple-600";
    case "sci-tech":
      return "bg-indigo-600";
    case "sports":
      return "bg-orange-500";
    case "opinion":
      return "bg-teal-600";
    case "literary":
      return "bg-pink-600";
    default:
      return "bg-gray-600";
  }
};

const ArticleDetail: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const { user } = useAuth();

  const [publication, setPublication] = useState<Publication | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadySubmittedModal, setShowAlreadySubmittedModal] =
    useState(false);
  const [requestingCredit, setRequestingCredit] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [idOrSlug]);

  useEffect(() => {
    if (!idOrSlug) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [pubResponse, commentsResponse] = await Promise.all([
          AxiosInstance.get<Publication>(`/publications/${idOrSlug}`),
          AxiosInstance.get<Comment[]>(
            `/publications/${idOrSlug}/comments`
          ).catch(() => ({ data: [] })),
        ]);
        setPublication(pubResponse.data);
        if (Array.isArray(commentsResponse.data)) {
          setComments(commentsResponse.data);
        }
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          setError("Access Denied: This article is pending approval.");
        } else {
          setError("Failed to load article.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idOrSlug]);

  const handleClaimClick = () => {
    if (!publication || !user) return;
    setIsClaimModalOpen(true);
  };

  const submitClaimRequest = async () => {
    if (!publication) return;

    try {
      setRequestingCredit(true);
      await AxiosInstance.post(
        `/publications/${publication.publication_id}/request-credit`
      );

      setIsClaimModalOpen(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setIsClaimModalOpen(false);
        setShowAlreadySubmittedModal(true);
      } else if (error.response?.status === 422) {
        toast.warning("You are already listed as a writer.");
        setIsClaimModalOpen(false);
      } else {
        toast.error("Failed to send request. Please try again.");
      }
    } finally {
      setRequestingCredit(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 font-bold">
        {error}
      </div>
    );
  if (!publication)
    return (
      <div className="p-8 text-center text-gray-600">Article not found.</div>
    );

  const isWriter = user && publication.writers?.some((w) => w.id === user.id);

  const badgeColorClass = getCategoryColor(publication.category);

  return (
    <div className="min-h-screen bg-white">
      <ConfirmationModal
        isOpen={isClaimModalOpen}
        onClose={() => !requestingCredit && setIsClaimModalOpen(false)}
        onConfirm={submitClaimRequest}
        title="Claim Authorship"
        message={`Are you sure you want to submit a request to be credited as an author for "${publication.title}"?`}
        confirmLabel="Submit Request"
        cancelLabel="Cancel"
        isLoading={requestingCredit}
        isDangerous={false}
      />

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
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Request Sent!
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your request has been submitted successfully. The administrator
              will review your claim shortly.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg shadow-green-200 transition-all"
            >
              Okay, Got it
            </button>
          </div>
        </div>
      )}

      {showAlreadySubmittedModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAlreadySubmittedModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <FaInfoCircle className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Request Pending
            </h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              You have already submitted a request for this article. Please wait
              for the administrator to approve it.
            </p>
            <button
              onClick={() => setShowAlreadySubmittedModal(false)}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {publication.status === "pending" && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4"
          role="alert"
        >
          <p className="font-bold">Pending Approval</p>
          <p>
            This article is currently hidden from the public. You are viewing it
            in preview mode.
          </p>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row lg:space-x-8">
        <div className="flex-1">
          <div
            className={`inline-block text-white rounded-full px-3 py-1 text-xs font-bold mb-2 uppercase shadow-sm ${badgeColorClass}`}
          >
            {publication.category}
          </div>

          <h1 className="text-4xl font-extrabold text-black mb-4 leading-tight">
            {publication.title}
          </h1>

          <div className="flex flex-wrap items-center text-gray-600 mb-6 gap-4 text-sm">
            <div className="flex items-center space-x-1">
              <FaCalendarAlt className="text-green-600" />
              <span className="font-medium">
                {new Date(
                  publication.date_published ||
                    publication.created_at ||
                    (publication as any).updated_at ||
                    Date.now()
                ).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-1">
              <span className="mr-1">By</span>
              {publication.writers && publication.writers.length > 0 ? (
                publication.writers.map((writer, index) => (
                  <span key={writer.id} className="flex items-center">
                    <Link
                      to={`/profile/${writer.id}`}
                      className="font-bold hover:text-green-700 hover:underline transition-colors"
                    >
                      {writer.name}
                    </Link>
                    {index < publication.writers!.length - 2 && (
                      <span className="mr-1">,</span>
                    )}
                    {index === publication.writers!.length - 2 && (
                      <span className="mx-1">&</span>
                    )}
                  </span>
                ))
              ) : (
                <span className="font-bold">
                  {publication.byline || "The Hillside Echo"}
                </span>
              )}

              {user && !isWriter && (
                <button
                  onClick={handleClaimClick}
                  disabled={requestingCredit}
                  className="ml-2 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:border-green-300"
                >
                  <FaUserPlus /> Add Attribute
                </button>
              )}
            </div>
          </div>

          {publication.image && (
            <div className="relative mb-4">
              <img
                src={publication.image}
                alt={publication.title}
                className="w-full h-auto rounded-md object-cover"
              />
              {publication.photo_credits && (
                <div className="absolute bottom-0 right-0 bg-white bg-opacity-75 px-3 py-1 text-xs text-gray-500 italic rounded-tl-md">
                  Photo from{" "}
                  <span className="font-bold">{publication.photo_credits}</span>
                </div>
              )}
            </div>
          )}

          <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
            {(publication.body ?? "").split("\n").map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </article>

          <Comments
            publicationId={publication.publication_id}
            comments={comments}
            setComments={setComments}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
