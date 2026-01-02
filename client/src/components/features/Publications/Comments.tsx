import React, { useState, useCallback } from "react";
import axios from "../../../AxiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { LoginModal } from "../../common/LoginModal/LoginModal";
import {
  FaUserCircle,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaLock,
  FaExclamationCircle,
  FaHistory,
} from "react-icons/fa";
import ConfirmationModal from "../../common/ConfirmationModal";
import { usePolling } from "../../../hooks/usePolling";

interface CommentAuthor {
  id: number;
  name: string;
}

interface CommentHistory {
  id: number;
  body: string;
  created_at: string;
}

export interface Comment {
  id: number;
  body: string;
  user: CommentAuthor;
  created_at: string;
  is_edited: boolean;
}

interface CommentsProps {
  publicationId: number;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

export function Comments({
  publicationId,
  comments,
  setComments,
}: CommentsProps) {
  const { user } = useAuth();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<CommentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [newComment, setNewComment] = useState("");

  const fetchLatestComments = useCallback(async () => {
    try {
      const response = await axios.get(
        `/publications/${publicationId}/comments`
      );

      setComments(response.data);
    } catch (err) {
      console.error("Silent comment sync failed", err);
    }
  }, [publicationId, setComments]);

  usePolling(fetchLatestComments, 10000);

  const handleGuestClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;
    setError(null);

    try {
      const response = await axios.post(
        `/publications/${publicationId}/comments`,
        { body: newComment }
      );
      setComments([response.data, ...comments]);
      setNewComment("");

      fetchLatestComments();
    } catch (err) {
      setError("Unable to post your comment. Please try again.");
    }
  };

  const startEditing = (comment: Comment) => {
    setError(null);
    setEditingId(comment.id);
    setEditText(comment.body);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
    setError(null);
  };

  const saveEdit = async (id: number) => {
    if (editText.trim() === "") return;
    setError(null);

    try {
      const updatedList = comments.map((c) =>
        c.id === id ? { ...c, body: editText, is_edited: true } : c
      );
      setComments(updatedList);
      setEditingId(null);

      await axios.put(`/comments/${id}`, { body: editText });
    } catch (error) {
      setError("Unable to save your changes. Please check your connection.");
    }
  };

  const initiateDelete = (id: number) => {
    setError(null);
    setCommentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (commentToDelete === null) return;
    setIsDeleting(true);
    setError(null);

    try {
      const filteredList = comments.filter((c) => c.id !== commentToDelete);
      setComments(filteredList);

      await axios.delete(`/comments/${commentToDelete}`);

      setIsDeleteModalOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      setIsDeleteModalOpen(false);
      setError("We couldn't delete that comment. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const viewHistory = async (commentId: number) => {
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    setHistoryData([]);

    try {
      const response = await axios.get(`/comments/${commentId}/history`);
      setHistoryData(response.data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <section className="comments-section mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-xl font-bold text-green-800 mb-6 flex items-center gap-2">
        {user ? `Comments (${comments.length})` : "Comments"}
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3 shadow-sm animate-fadeIn">
          <FaExclamationCircle className="mt-1 flex-shrink-0" />
          <div className="flex-1 text-sm font-medium">{error}</div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="mb-8">
        {user ? (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2 text-green-700 font-semibold">
              <FaUserCircle className="mr-2" />
              Posting as {user.name}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                if (error) setError(null);
              }}
              rows={3}
              placeholder="Share your thoughts..."
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={(e) => handleSubmit(e as any)}
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
              >
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <div
            className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition-all group"
            onClick={handleGuestClick}
          >
            <div className="bg-green-100 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <FaLock className="text-green-600 text-xl" />
            </div>
            <h4 className="text-gray-800 font-bold text-lg">
              Join the discussion
            </h4>
            <p className="text-gray-500 text-sm mb-4">
              Log in or sign up to leave a comment.
            </p>
            <button className="px-6 py-2 bg-green-700 text-white font-semibold rounded-full hover:bg-green-800 transition-colors shadow-sm">
              Log In
            </button>
          </div>
        )}
      </div>

      {user ? (
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-gray-500 italic">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <FaUserCircle className="text-3xl text-gray-400" />
                </div>

                <div className="flex-1">
                  <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none relative group">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-gray-900 text-sm">
                        {comment.user.name}
                      </strong>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>

                        {comment.is_edited && (
                          <button
                            onClick={() => viewHistory(comment.id)}
                            className="text-xs text-gray-400 hover:text-green-700 underline decoration-dotted cursor-pointer transition-colors"
                            title="View Edit History"
                          >
                            (Edited)
                          </button>
                        )}

                        {(user.id === comment.user.id ||
                          user.role === "admin") &&
                          !editingId && (
                            <div className="flex gap-2 ml-2 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
                              <button
                                onClick={() => startEditing(comment)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
                                title="Edit"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => initiateDelete(comment.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          )}
                      </div>
                    </div>

                    {editingId === comment.id ? (
                      <div className="mt-2 animate-fadeIn">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full p-2 border border-green-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={cancelEditing}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            <FaTimes /> Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(comment.id)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-white bg-green-700 rounded hover:bg-green-800"
                          >
                            <FaCheck /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 text-sm leading-relaxed break-words">
                        {comment.body}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded border border-gray-100 mt-4">
          <p className="text-gray-500 italic">
            Comments are hidden for guests.
          </p>
        </div>
      )}

      {historyModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setHistoryModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaHistory className="text-green-700" /> Edit History
              </h3>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar">
              {loadingHistory ? (
                <div className="flex justify-center py-8 text-gray-400">
                  Loading history...
                </div>
              ) : historyData.length > 0 ? (
                <div className="space-y-4">
                  {historyData.map((item) => (
                    <div
                      key={item.id}
                      className="border-l-2 border-gray-200 pl-4 pb-4 last:pb-0 relative"
                    >
                      <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-gray-400"></div>

                      <p className="text-xs text-gray-500 mb-1 font-mono uppercase">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                      <div className="bg-gray-100 p-3 rounded text-sm text-gray-700">
                        {item.body}
                      </div>
                    </div>
                  ))}
                  <div className="border-l-2 border-green-500 pl-4 relative pt-2">
                    <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-green-600"></div>
                    <p className="text-xs text-green-700 font-bold uppercase mb-1">
                      Current Version
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 italic">
                  No edit history available.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={isDeleting}
      />
    </section>
  );
}
