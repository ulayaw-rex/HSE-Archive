import React from "react";
import { Link } from "react-router-dom";
import type { Publication } from "../../../types/Publication";

interface GuestPublicationCardProps {
  publication: Publication;
}

const GuestPublicationCard: React.FC<GuestPublicationCardProps> = ({
  publication,
}) => {
  return (
    <Link
      to={`/news/${publication.publication_id}`}
      className="max-w-sm overflow-hidden  bg-white block hover:shadow-xl transition-shadow duration-300"
    >
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
    </Link>
  );
};

export default GuestPublicationCard;
