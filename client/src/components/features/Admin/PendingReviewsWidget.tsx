import React, { useState } from "react";
import { FaCheck, FaTimes, FaEye } from "react-icons/fa";
import AxiosInstance from "../../../AxiosInstance";
import { toast } from "react-toastify";
import type { Publication } from "../../../types/Publication";

import PublicationViewModal from "./PublicationViewModal";
import ConfirmationModal from "../../common/ConfirmationModal";

interface PendingReviewsWidgetProps {
  publications: Publication[];
  onReviewComplete: () => void;
}

const PendingReviewsWidget: React.FC<PendingReviewsWidgetProps> = ({
  publications,
  onReviewComplete,
}) => {
  const [processingId, setProcessingId] = useState<number | null>(null);

  const [viewingArticle, setViewingArticle] = useState<Publication | null>(
    null
  );

  const [articleToApprove, setArticleToApprove] = useState<Publication | null>(
    null
  );

  const pendingItems = publications.filter((p) => p.status === "pending");

  const handleConfirmApprove = async () => {
    if (!articleToApprove) return;

    setProcessingId(articleToApprove.publication_id);
    try {
      await AxiosInstance.put(
        `/publications/${articleToApprove.publication_id}/review`,
        { status: "approved" }
      );
      toast.success("Article published successfully!");
      setArticleToApprove(null);
      onReviewComplete();
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve article");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm("Are you sure you want to REJECT this article?"))
      return;

    setProcessingId(id);
    try {
      await AxiosInstance.put(`/publications/${id}/review`, {
        status: "rejected",
      });
      toast.info("Article rejected.");
      onReviewComplete();
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (pendingItems.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
        <div className="text-green-500 text-4xl mb-2">✓</div>
        <h3 className="text-gray-800 font-bold">All Caught Up!</h3>
        <p className="text-gray-500 text-sm">No pending articles to review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-orange-50">
          <h3 className="text-orange-800 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Pending Reviews ({pendingItems.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {pendingItems.map((article) => (
            <div
              key={article.publication_id}
              className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 truncate">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  By{" "}
                  <span className="font-medium text-gray-700">
                    {article.byline || "Unknown"}
                  </span>{" "}
                  • {new Date(article.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewingArticle(article)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Preview Article"
                >
                  <FaEye />
                </button>

                <button
                  onClick={() => handleReject(article.publication_id)}
                  disabled={processingId === article.publication_id}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Reject"
                >
                  <FaTimes />
                </button>

                <button
                  onClick={() => setArticleToApprove(article)}
                  disabled={processingId === article.publication_id}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-full hover:bg-green-700 shadow-sm flex items-center gap-2 transition-all transform active:scale-95"
                >
                  {processingId === article.publication_id ? (
                    "..."
                  ) : (
                    <>
                      <FaCheck /> Approve
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PublicationViewModal
        isOpen={!!viewingArticle}
        onClose={() => setViewingArticle(null)}
        publication={viewingArticle}
      />

      <ConfirmationModal
        isOpen={!!articleToApprove}
        onClose={() => setArticleToApprove(null)}
        onConfirm={handleConfirmApprove}
        title="Publish Article"
        message={`Are you sure you want to approve "${articleToApprove?.title}"? It will become visible on the website immediately.`}
        confirmLabel="Approve & Publish"
        cancelLabel="Back"
        isLoading={processingId === articleToApprove?.publication_id}
      />
    </>
  );
};

export default PendingReviewsWidget;
