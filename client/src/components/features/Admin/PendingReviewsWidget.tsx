import React, { useState } from "react";
import { FaCheck, FaTimes, FaEye, FaFeatherAlt } from "react-icons/fa";
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-700">
              <FaFeatherAlt />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Article Reviews</h3>
              <p className="text-xs text-green-700 font-medium">
                Pending publication
              </p>
            </div>
          </div>
          <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
            {pendingItems.length}
          </span>
        </div>

        <div
          className="overflow-y-auto p-0 flex-1 custom-scrollbar"
          style={{ maxHeight: "300px" }}
        >
          {pendingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="text-green-500 text-3xl mb-3">✓</div>
              <h3 className="text-gray-800 font-bold text-sm">
                All Caught Up!
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                No pending articles to review.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {pendingItems.map((article) => (
                <div
                  key={article.publication_id}
                  className="p-4 flex flex-col gap-2 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="font-bold text-gray-800 text-sm truncate">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        By{" "}
                        <span className="font-medium text-gray-700">
                          {article.byline || "Unknown"}
                        </span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Submitted{" "}
                        {new Date(article.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingArticle(article)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <FaEye size={14} />
                      </button>

                      <button
                        onClick={() => setArticleToApprove(article)}
                        disabled={processingId === article.publication_id}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        <FaCheck size={14} />
                      </button>

                      <button
                        onClick={() => handleReject(article.publication_id)}
                        disabled={processingId === article.publication_id}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        <FaTimes size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
