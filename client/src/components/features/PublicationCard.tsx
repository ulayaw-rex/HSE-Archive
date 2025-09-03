import React from "react";
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {publication.image && (
        <div className="w-full h-48 overflow-hidden bg-gray-100">
          <img
            src={publication.image}
            alt={publication.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="inline-block px-2 py-1 mb-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {publication.category}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {publication.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{publication.byline}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {new Date(publication.created_at).toLocaleDateString()}
          </span>
          <div className="space-x-2">
            <button
              onClick={() => onEdit(publication)}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(publication.id)}
              className="text-red-600 hover:text-red-900 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationCard;
