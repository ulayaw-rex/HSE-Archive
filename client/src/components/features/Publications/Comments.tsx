import React, { useState } from "react";
import axios from "../../../AxiosInstance";
import { useAuth } from "../../../context/AuthContext";
import { LoginModal } from "../../common/LoginModal/LoginModal";
import { toast } from "react-toastify";
import {
  FaUserCircle,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaLock,
} from "react-icons/fa";
import ConfirmationModal from "../../common/ConfirmationModal";

interface CommentAuthor {
  id: number;
  name: string;
}

export interface Comment {
  id: number;
  body: string;
  user: CommentAuthor;
  created_at: string;
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

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newComment, setNewComment] = useState("");

  const handleGuestClick = () => {
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

  const initiateDelete = (id: number) => {
    setCommentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (commentToDelete === null) return;

    setIsDeleting(true);
    try {
      const filteredList = comments.filter((c) => c.id !== commentToDelete);
      setComments(filteredList);

      await axios.delete(`/comments/${commentToDelete}`);
      toast.success("Comment deleted");

      setIsDeleteModalOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="comments-section mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-xl font-bold text-green-800 mb-6">
        {user ? `Comments (${comments.length})` : "Comments"}
      </h3>

      <div className="mb-8">
        {user ? (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg">
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
