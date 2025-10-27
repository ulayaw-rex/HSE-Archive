import React, { useState, useEffect, useMemo } from "react";
import axios from "../../../AxiosInstance";

// --- Type Definitions ---
// This is the User object your backend sends with the comment
interface CommentAuthor {
  id: number;
  name: string;
}

// This is the main Comment object
interface Comment {
  id: number;
  body: string;
  user: CommentAuthor; // The author is nested inside
  created_at: string;
}

// This component needs the ID of the publication it's on
interface CommentsProps {
  publicationId: number;
}

export function Comments({ publicationId }: CommentsProps) {
  // Get the logged-in user from localStorage (same as other components)
  const user = useMemo(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // --- 1. FETCH COMMENTS --- // This runs when the component first loads

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null); // Call the API route we created
        const response = await axios.get(
          `/publications/${publicationId}/comments`
        );
        setComments(response.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
        setError("Failed to load comments. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [publicationId]); // Re-run this if the publicationId prop ever changes // --- 2. SUBMIT A NEW COMMENT ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === "") return; // Don't submit empty comments

    try {
      // Call the POST API route we created
      const response = await axios.post(
        `/api/publications/${publicationId}/comments`,
        { body: newComment }
      ); // Add the new comment (response.data) to the top of the list // This makes the UI update instantly

      setComments([response.data, ...comments]);
      setNewComment(""); // Clear the textarea
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("There was an error posting your comment.");
    }
  }; // --- 3. RENDER THE COMPONENT ---

  if (loading) {
    return <div>Loading comments...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <section className="comments-section" style={{ marginTop: "2rem" }}>
            {/* --- COMMENT FORM --- */}     {" "}
      {/* This is the key: only show the form if a user is logged in */}     {" "}
      {user ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
                    <h4>Leave a Comment</h4>         {" "}
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Write your comment..."
            required
            style={{ width: "100%", padding: "10px" }}
          />
                   {" "}
          <button type="submit" style={{ marginTop: "10px" }}>
                        Post Comment          {" "}
          </button>
                 {" "}
        </form>
      ) : (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            border: "1px solid #ccc",
          }}
        >
                    {/* You can make this a <Link> to your login page */}       
            Please log in to leave a comment.        {" "}
        </div>
      )}
            {/* --- COMMENTS LIST --- */}     {" "}
      <div className="comments-list">
                <h3>Comments ({comments.length})</h3>       {" "}
        {comments.length === 0 ? (
          <p>No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="comment"
              style={{ borderBottom: "1px solid #eee", padding: "15px 0" }}
            >
                           {" "}
              <strong style={{ display: "block", marginBottom: "5px" }}>
                                {comment.user.name}             {" "}
              </strong>
                            <p style={{ margin: 0 }}>{comment.body}</p>         
                 {" "}
              <small style={{ color: "#888" }}>
                                {new Date(comment.created_at).toLocaleString()} 
                           {" "}
              </small>
                         {" "}
            </div>
          ))
        )}
             {" "}
      </div>
         {" "}
    </section>
  );
}
