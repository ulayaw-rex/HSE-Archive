import React from "react";
import { FaCalendarAlt } from "react-icons/fa";
import type { Publication } from "../../types/Publication";

interface ArticleDetailProps {
  publication?: Publication;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ publication }) => {
  if (!publication) {
    return (
      <div className="p-8 text-center text-gray-600">Loading article...</div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="inline-block bg-gray-300 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold mb-2 uppercase">
          {publication.category}
        </div>

        <h1 className="text-4xl font-extrabold text-black mb-4 leading-tight">
          {publication.title}
        </h1>

        <div className="flex items-center text-gray-600 mb-6 space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <FaCalendarAlt />
            <span>{new Date(publication.created_at).toLocaleDateString()}</span>
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
    </div>
  );
};

export default ArticleDetail;
