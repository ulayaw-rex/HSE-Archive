import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaCalendarAlt, FaFacebookF, FaInstagram } from "react-icons/fa";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type { Publication } from "../../types/Publication";
import {
  Comments,
  type Comment,
} from "../../components/features/Publications/Comments";

const ArticleDetail: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();

  const [publication, setPublication] = useState<Publication | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [idOrSlug]);
  const [comments, setComments] = useState<Comment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

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
        console.error("Failed to fetch data:", err);
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

  if (loading) {
    return (
      <div className="p-8 text-center h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!publication) {
    return (
      <div className="p-8 text-center text-gray-600">Article not found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
        {/* Main content */}
        <div className="flex-1">
          <div className="inline-block bg-gray-300 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold mb-2 uppercase">
            {publication.category}
          </div>

          <h1 className="text-4xl font-extrabold text-black mb-4 leading-tight">
            {publication.title}
          </h1>

          <div className="flex items-center text-gray-600 mb-6 space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <FaCalendarAlt />
              <span>
                {new Date(
                  publication.created_at ||
                    (publication as any).updated_at ||
                    Date.now()
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>
                By{" "}
                {publication.user_id ? (
                  <Link
                    to={`/profile/${publication.user_id}`}
                    className="font-bold hover:text-green-700 hover:underline transition-colors"
                  >
                    {publication.byline || "Hillsider Member"}
                  </Link>
                ) : (
                  <span className="font-bold">
                    {publication.byline || "The Hillside Echo"}
                  </span>
                )}
              </span>

              {/* Only show "Add Attribute" if it's the writer looking at their own post */}
              {currentUser && currentUser.id === publication.user_id && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(
                      new CustomEvent("open-attribute-editor", {
                        detail: { publicationId: publication.publication_id },
                      })
                    );
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-600"
                >
                  Add attribute +
                </a>
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

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col space-y-4 top-20 self-start">
          {/* Social Share Buttons */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              window.location.href
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            className="text-blue-600 hover:text-blue-800"
          >
            <div
              style={{
                background: "#1877F2",
                borderRadius: "50%",
                padding: "10px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaFacebookF size={24} color="#fff" />
            </div>{" "}
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-pink-600 hover:text-pink-800"
          >
            <div
              style={{
                background:
                  "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                borderRadius: "50%",
                padding: "8px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaInstagram size={24} color="#fff" />
            </div>
          </a>
        </aside>
      </div>
    </div>
  );
};

export default ArticleDetail;
