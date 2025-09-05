import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaCalendarAlt,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
} from "react-icons/fa";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type { Publication } from "../../types/Publication";

const ArticleDetail: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) return;

    const fetchPublication = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AxiosInstance.get<Publication>(
          `/publications/${idOrSlug}`
        );
        setPublication(response.data);
      } catch (err) {
        console.error("Failed to fetch publication:", err);
        setError("Failed to load article.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublication();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!publication) {
    return (
      <div className="p-8 text-center text-gray-600">Article not found.</div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
                {new Date(publication.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              By <span className="font-bold">{publication.byline}</span>
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
            {publication.body.split("\n").map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </article>
        </div>

        {/* Sidebar with social media icons */}
        <aside className="hidden lg:flex flex-col space-y-4 sticky top-20 self-start">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              window.location.href
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            className="text-blue-600 hover:text-blue-800"
          >
            <FaFacebookF size={24} />
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-pink-600 hover:text-pink-800"
          >
            <FaInstagram size={24} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              window.location.href
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter"
            className="text-blue-400 hover:text-blue-600"
          >
            <FaTwitter size={24} />
          </a>
        </aside>
      </div>
    </div>
  );
};

export default ArticleDetail;
