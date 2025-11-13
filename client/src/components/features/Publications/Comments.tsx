import React, { useState, useEffect } from "react";
import axios from "../../../AxiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { LoginModal } from "../../common/LoginModal/LoginModal";
import LoadingSpinner from "../../common/LoadingSpinner";
import { toast } from "react-toastify";
import {
  FaUserCircle,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

// 1. IMPORT YOUR EXISTING MODAL
// (Adjust the path to where your file is located)
import ConfirmationModal from "../../common/ConfirmationModal";

interface CommentAuthor {
  id: number;
  name: string;
}

interface Comment {
  id: number;
  body: string;
  user: CommentAuthor;
  created_at: string;
}

interface CommentsProps {
  publicationId: number;
}

export function Comments({ publicationId }: CommentsProps) {
  const { user } = useAuth();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);

  // Editing State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  // --- 2. DELETE MODAL STATE ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // --- FETCH COMMENTS ---
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/publications/${publicationId}/comments`
        );
        setComments(response.data);
      } catch (err) {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [publicationId, user]);

  // --- HANDLERS ---

  const handleGuestClick = () => {
    toast.error(
      <div>
        <strong>Login required</strong>
        <p className="text-sm mt-1">Sign in to join the discussion.</p>
      </div>,
      { toastId: "guest-login-error", position: "top-right" }
    );
    setIsLoginModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    try {
      const response = await axios.post(
        `/publications/${publicationId}/comments`,
        { body: newComment }
      );
      setComments([response.data, ...comments]);
      setNewComment("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error("Failed to post comment.");
    }
  };

  // Edit Logic
  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.body);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id: number) => {
    if (editText.trim() === "") return;

    try {
      const updatedList = comments.map((c) =>
        c.id === id ? { ...c, body: editText } : c
      );
      setComments(updatedList);
      setEditingId(null);

      await axios.put(`/comments/${id}`, { body: editText });
      toast.success("Comment updated");
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  // --- 3. DELETE LOGIC (SPLIT IN TWO) ---

  // Part A: User clicks trash icon -> Open Modal
  const initiateDelete = (id: number) => {
    setCommentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Part B: User confirms in Modal -> Call API
  const confirmDelete = async () => {
    if (commentToDelete === null) return;

    setIsDeleting(true);
    try {
      // Optimistic UI update
      const filteredList = comments.filter((c) => c.id !== commentToDelete);
      setComments(filteredList);

      await axios.delete(`/comments/${commentToDelete}`);
      toast.success("Comment deleted");

      // Close modal
      setIsDeleteModalOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="mt-8">
        <LoadingSpinner />
      </div>
    );

  return (
    <section className="comments-section mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-xl font-bold text-green-800 mb-6">
        {user ? `Comments (${comments.length})` : "Comments"}
      </h3>

      {/* --- FORM --- */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
        {user ? (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center mb-2 text-green-700 font-semibold">
              <FaUserCircle className="mr-2" />
              Posting as {user.name}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              placeholder="Share your thoughts..."
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              required
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
              >
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="relative cursor-pointer">
            <div className="flex items-center mb-2 text-gray-400 font-semibold">
              <FaUserCircle className="mr-2" /> Log in to post...
            </div>
            <textarea
              rows={3}
              placeholder="Write your comment..."
              className="w-full p-3 border border-gray-300 rounded bg-white cursor-pointer pointer-events-none"
              readOnly
            />
            <div className="flex justify-end mt-2">
              <button
                className="px-4 py-2 bg-green-700 text-white opacity-50 cursor-not-allowed rounded"
                disabled
              >
                Post Comment
              </button>
            </div>
            <div
              className="absolute inset-0 z-10"
              onClick={handleGuestClick}
            ></div>
          </div>
        )}
      </div>

      {/* --- LIST --- */}
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

                        {(user.id === comment.user.id ||
                          user.role === "admin") &&
                          !editingId && (
                            <div className="flex gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => startEditing(comment)}
                                className="text-gray-400 hover:text-green-600 transition-colors"
                                title="Edit"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                // UPDATE: Call initiateDelete instead of deleteComment
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
        <div className="text-center py-8 bg-gray-50 rounded border border-gray-100">
          <p className="text-gray-500 italic">
            Comments are hidden for guests.
          </p>
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* 4. ADD YOUR CUSTOM CONFIRMATION MODAL HERE */}
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
