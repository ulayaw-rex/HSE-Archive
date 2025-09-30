import React, { useState } from "react";
import type { Publication } from "../../../types/Publication";
import PublicationViewModal from "./PublicationViewModal";

interface PublicationCardProps {
  publication: Publication;
  onEdit: (publication: Publication) => void;
  onDelete: (id: number) => void;
}

const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  onEdit,
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div
        className={`publication-card relative rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-gray-900 cursor-pointer ${
          publication.image ? "has-background" : ""
        }`}
        style={
          publication.image
            ? { backgroundImage: `url(${publication.image})` }
            : undefined
        }
        onClick={openModal}
      >
        <div className="publication-card-overlay absolute inset-0"></div>
        <div className="relative block p-4 z-10">
          <div className="inline-block px-2 py-1 mb-2 text-xs font-semibold rounded-full bg-black text-white uppercase">
            {publication.category}
          </div>
          <h3 className="text-lg font-semibold mb-2">{publication.title}</h3>
          <p className="text-sm mb-4">{publication.byline}</p>
          <div className="flex justify-between items-center text-gray-700">
            <span className="text-sm">
              {new Date(publication.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="absolute top-2 right-2 flex space-x-2 z-20">
          {/* Edit Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(publication);
            }}
            aria-label="Edit"
            className="print-media-edit-btn print-media-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
              />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(publication.publication_id);
            }}
            aria-label="Delete"
            className="print-media-delete-btn print-media-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
      <PublicationViewModal
        publication={publication}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default PublicationCard;
