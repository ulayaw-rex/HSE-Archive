import React, { useState } from "react";
import { Link } from "react-router-dom";
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
        <div className="absolute bottom-4 right-4 space-x-2 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(publication);
            }}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(publication.publication_id);
            }}
            className="text-red-600 hover:text-red-900 text-sm font-medium"
          >
            Delete
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
