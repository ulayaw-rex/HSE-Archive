import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUserPlus,
  FaCheckCircle,
  FaInfoCircle,
  FaExclamationCircle,
  FaMinus,
  FaPlus,
  FaUndo,
} from "react-icons/fa";
import AxiosInstance from "../../AxiosInstance";
import { useQuery } from "@tanstack/react-query";
import ConfirmationModal from "../../components/common/ConfirmationModal";
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

  const fetchArticleData = async () => {
    if (!idOrSlug) throw new Error("No article ID");
    const [pubResponse, commentsResponse] = await Promise.all([
      AxiosInstance.get<Publication>(`/publications/${idOrSlug}`),
      AxiosInstance.get<Comment[]>(`/publications/${idOrSlug}/comments`).catch(
        () => ({ data: [] })
      ),
    ]);
    return {
      publication: pubResponse.data,
      commentsData: Array.isArray(commentsResponse.data) ? commentsResponse.data : [],
    };
  };

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["article", idOrSlug],
    queryFn: fetchArticleData,
    enabled: !!idOrSlug,
    retry: false,
  });

  const publication = data?.publication || null;
  const [comments, setComments] = useState<Comment[]>([]);
  
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAlreadySubmittedModal, setShowAlreadySubmittedModal] = useState(false);
  const [showAlreadyWriterModal, setShowAlreadyWriterModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [requestingCredit, setRequestingCredit] = useState(false);
  const [textSize, setTextSize] = useState<number>(18);
  
  // Hydrate comments when data arrives so they can be mutated locally 
  // without mutating the query cache directly.
  useEffect(() => {
    if (data?.commentsData) {
      setComments(data.commentsData);
    }
  }, [data?.commentsData]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [idOrSlug]);

  const error = queryError 
    ? ((queryError as any).response?.status === 403 
        ? "Access Denied: This article is pending approval." 
        : "Failed to load article.")
    : null;

  const handleClaimClick = () => {
    if (!publication || !user) return;
    setIsClaimModalOpen(true);
  };

  const submitClaimRequest = async () => {
    if (!publication) return;

    try {
      setRequestingCredit(true);
      await AxiosInstance.post(
        `/publications/${publication.publication_id}/request-credit`,
      );
      setIsClaimModalOpen(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      setIsClaimModalOpen(false);
      if (error.response?.status === 409) {
        setShowAlreadySubmittedModal(true);
      } else if (error.response?.status === 422) {
        setShowAlreadyWriterModal(true);
      } else {
        setShowErrorModal(true);
      }
    } finally {
      setRequestingCredit(false);
    }
  };

  const increaseTextSize = () => setTextSize((prev) => Math.min(prev + 2, 36));
  const decreaseTextSize = () => setTextSize((prev) => Math.max(prev - 2, 12));
  const resetTextSize = () => setTextSize(18);

  if (loading)
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            {/* Category badge */}
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-3" />

            {/* Title */}
            <div className="space-y-2 mb-4">
              <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>

            {/* Date + byline */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>

            {/* Article image — contained, same padding as content */}
            <div className="w-full h-72 sm:h-96 bg-gray-200 dark:bg-gray-700 rounded-md mb-5" />

            {/* Text size control bar */}
            <div className="h-9 w-48 bg-gray-100 dark:bg-gray-800 rounded-full mb-6 border border-gray-200 dark:border-gray-700" />

            {/* Body paragraphs */}
            <div className="space-y-2.5">
              {[100, 100, 100, 88, 100, 100, 92, 72].map((w, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                  style={{ width: `${w}%` }}
                />
              ))}
              <div className="pt-3" />
              {[100, 100, 95, 100, 80, 60].map((w, i) => (
                <div
                  key={`b${i}`}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                  style={{ width: `${w}%` }}
                />
              ))}
              <div className="pt-3" />
              {[100, 100, 88, 75].map((w, i) => (
                <div
                  key={`c${i}`}
                  className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>

            {/* Comments section stub */}
            <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-24 w-full bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700" />
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-red-600 dark:text-red-500 font-bold">
        {error}
      </div>
    );
  if (!publication)
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 min-h-screen">Article not found.</div>
    );

  const isWriter = user && publication.writers?.some((w) => w.id === user.id);
  const badgeColorClass = getCategoryColor(publication.category);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
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
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 border border-transparent dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <FaCheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Request Sent!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
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
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 border border-transparent dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
              <FaInfoCircle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Request Pending
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              You have already submitted a request for this article. Please wait
              for approval.
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

      {showAlreadyWriterModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowAlreadyWriterModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 border border-transparent dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-6">
              <FaInfoCircle className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Already Listed
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              You are already credited as a writer for this article. No further
              action is needed.
            </p>
            <button
              onClick={() => setShowAlreadyWriterModal(false)}
              className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl shadow-lg shadow-yellow-200 transition-all"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowErrorModal(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all scale-100 border border-transparent dark:border-gray-700">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
              <FaExclamationCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Something Went Wrong
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              We couldn't process your request at this time. Please try again
              later.
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg shadow-red-200 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {publication.status === "submitted" && (
        <div
          className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-400 p-4 mb-4"
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

          <h1 className="text-4xl font-extrabold text-black dark:text-gray-100 mb-4 leading-tight">
            {publication.title}
          </h1>

          <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-400 mb-6 gap-4 text-sm">
            <div className="flex items-center space-x-1">
              <FaCalendarAlt className="text-green-600 dark:text-green-500" />
              <span className="font-medium">
                {new Date(
                  publication.date_published ||
                    publication.created_at ||
                    (publication as any).updated_at ||
                    Date.now(),
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
                      className="font-bold hover:text-green-700 dark:hover:text-green-400 hover:underline transition-colors"
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
                  className="ml-2 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 hover:border-green-300 dark:hover:border-green-700"
                >
                  <FaUserPlus /> Add Attribute
                </button>
              )}
            </div>
          </div>

          {publication.image && (
            <div className="relative mb-6">
              <img
                src={publication.image}
                alt={publication.title}
                className="w-full h-auto rounded-md object-cover"
              />
              {publication.photo_credits && (() => {
                const credits = publication.photo_credits;
                let type = "Photo";
                let name = credits;
                if (credits.startsWith("Photo ")) {
                  type = "Photo";
                  name = credits.substring(6);
                } else if (credits.startsWith("Art ")) {
                  type = "Art";
                  name = credits.substring(4);
                } else if (credits.startsWith("Cartoon ")) {
                  type = "Cartoon";
                  name = credits.substring(8);
                }
                return (
                  <div className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 dark:bg-opacity-90 bg-opacity-75 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 rounded-tl-md shadow-sm">
                    {type}{" "}
                    <span className="font-bold italic">{name}</span>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex items-center mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm w-max overflow-hidden transition-all hover:shadow-md">
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest select-none">
                Text Size
              </span>
            </div>

            <button
               onClick={decreaseTextSize}
               disabled={textSize <= 12}
               className="px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 active:bg-green-100 dark:active:bg-green-900/50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all outline-none"
               title="Decrease text size"
             >
               <FaMinus size={12} />
             </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>

            <button
              onClick={resetTextSize}
              className="px-4 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 active:bg-gray-100 dark:active:bg-gray-800 text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 outline-none select-none"
              title="Reset to default"
            >
              <FaUndo size={10} /> Reset
            </button>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700"></div>

            <button
              onClick={increaseTextSize}
              disabled={textSize >= 36}
              className="px-4 py-2.5 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 active:bg-green-100 dark:active:bg-green-900/50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-all outline-none"
              title="Increase text size"
            >
              <FaPlus size={12} />
            </button>
          </div>

          <article
            className="prose max-w-none text-gray-800 dark:text-gray-200 leading-relaxed transition-all duration-300 ease-in-out"
            style={{ fontSize: `${textSize}px` }}
          >
            {(publication.body ?? "").split("\n").map((para, idx) => (
              <p key={idx} className="min-h-[1em] mb-4">
                {para}
              </p>
            ))}
          </article>

          <div className="mt-12">
            <Comments
              publicationId={publication.publication_id}
              comments={comments}
              setComments={setComments}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
