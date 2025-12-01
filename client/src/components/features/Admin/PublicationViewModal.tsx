import React from "react";
import type { Publication } from "../../../types/Publication";

interface PublicationViewModalProps {
  publication: Publication | null;
  isOpen: boolean;
  onClose: () => void;
}

const PublicationViewModal: React.FC<PublicationViewModalProps> = ({
  publication,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !publication) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-full overflow-y-auto relative z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold rounded-full bg-gray-300 text-gray-700 uppercase">
              {publication.category}
            </div>
            <h1 className="text-3xl font-extrabold mb-2">
              {publication.title}
            </h1>
            <div className="flex items-center text-gray-600 mb-4 space-x-4 text-sm">
              <span>
                {new Date(publication.created_at).toLocaleDateString()}
              </span>
              <span>
                By <strong>{publication.byline}</strong>
              </span>
            </div>
            {publication.image && (
              <img
                src={publication.image}
                alt={publication.title}
                className="w-full h-64 object-cover rounded mb-4"
              />
            )}
            {publication.photo_credits && (
              <p className="text-sm text-gray-500 mb-4">
                Photo: {publication.photo_credits}
              </p>
            )}
            <p className="text-gray-800 whitespace-pre-line">
              {publication.body}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicationViewModal;
