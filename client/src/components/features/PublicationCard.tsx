import React from "react";
import { Link } from "react-router-dom";
import type { Publication } from "../../types/Publication";

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
  return (
    <div
      className={`publication-card relative rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow text-gray-900 ${
        publication.image ? "has-background" : ""
      }`}
      style={
        publication.image
          ? { backgroundImage: `url(${publication.image})` }
          : undefined
      }
    >
      <div className="publication-card-overlay absolute inset-0"></div>
      <Link
        to={`/news/${publication.publication_id}`}
        className="relative block p-4 z-10"
      >
        <div className="inline-block px-2 py-1 mb-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {publication.category}
        </div>
        <h3 className="text-lg font-semibold mb-2">{publication.title}</h3>
        <p className="text-sm mb-4">{publication.byline}</p>
        <div className="flex justify-between items-center text-gray-700">
          <span className="text-sm">
            {new Date(publication.created_at).toLocaleDateString()}
          </span>
        </div>
      </Link>
      <div className="absolute bottom-4 right-4 space-x-2 z-20">
        <button
          onClick={() => onEdit(publication)}
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(publication.publication_id)}
          className="text-red-600 hover:text-red-900 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default PublicationCard;
