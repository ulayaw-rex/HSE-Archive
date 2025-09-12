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
          <div className="inline-block px-2 py-1 mb-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 uppercase">
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
            className="p-1 rounded-md bg-transparent hover:bg-transparent focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"
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
            className="p-1 rounded-md bg-transparent hover:bg-red-100 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z"
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
