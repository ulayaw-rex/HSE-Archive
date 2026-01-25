import React from "react";
import { FaCalendarAlt, FaUser } from "react-icons/fa";
import type { Publication } from "../../../types/Publication";
import DOMPurify from "dompurify";

interface PublicationViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication: Publication | null;
}

const PublicationViewModal: React.FC<PublicationViewModalProps> = ({
  isOpen,
  onClose,
  publication,
}) => {
  if (!isOpen || !publication) return null;

  const displayDate = new Date(
    publication.date_published || publication.created_at,
  );

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 text-white rounded-full p-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="overflow-y-auto custom-scrollbar">
          <div className="relative w-full h-64 md:h-80 bg-gray-100">
            {publication.image ? (
              <img
                src={publication.image}
                alt={publication.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <span className="text-6xl opacity-20">📰</span>
              </div>
            )}

            <div className="absolute bottom-6 left-6 md:left-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-green-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm">
                {publication.category}
              </span>
            </div>

            {publication.photo_credits && (
              <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-3 py-1 rounded-tl-lg backdrop-blur-sm">
                Photo: {publication.photo_credits}
              </div>
            )}
          </div>

          <div className="px-6 py-8 md:px-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              {publication.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                <span className="font-medium">
                  {displayDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FaUser className="text-green-600" />
                <span className="font-bold text-gray-800">
                  {publication.byline || "Hillsider Contributor"}
                </span>
              </div>
            </div>

            <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(publication.body || ""),
                }}
              />
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationViewModal;
