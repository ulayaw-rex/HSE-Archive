import React from "react";
import type { Publication } from "../../types/Publication";

interface GuestPublicationCardProps {
  publication: Publication;
}

const GuestPublicationCard: React.FC<GuestPublicationCardProps> = ({
  publication,
}) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-white">
      <img
        className="w-full h-48 object-cover"
        src={publication.image || ""}
        alt={publication.title || ""}
      />
      <div className="px-6 py-4">
        <div className="text-xs font-bold text-blue-700 uppercase mb-2">
          {publication.category.toUpperCase()}
        </div>
        <div className="font-bold text-xl mb-2">{publication.title}</div>
        <p className="text-gray-700 text-base line-clamp-3">
          {publication.body}
        </p>
        <p className="text-gray-500 text-xs mt-2">
          {new Date(publication.created_at).toLocaleDateString()}
        </p>
        {publication.photo_credits && (
          <p className="text-gray-400 text-xs mt-1">
            Photo: {publication.photo_credits}
          </p>
        )}
      </div>
    </div>
  );
};

export default GuestPublicationCard;
