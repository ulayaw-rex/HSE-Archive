import React from "react";
import type { Publication } from "../../../types/Publication";
import { Link } from "react-router-dom";

interface CategoryPublicationCardProps {
  publication: Publication;
}

const CategoryPublicationCard: React.FC<CategoryPublicationCardProps> = ({
  publication,
}) => {
  return (
    <Link
      to={`/news/${publication.publication_id}`}
      className="flex bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="w-1/3 flex-shrink-0">
        <img
          className="w-full h-full object-cover"
          src={publication.image || ""}
          alt={publication.title || ""}
        />
      </div>

      <div className="w-2/3 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
            {publication.title}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {publication.body}
          </p>

          <p className="text-gray-700 text-sm font-medium mb-1">
            By {publication.byline}
          </p>

          <p className="text-gray-500 text-xs mb-2">
            {new Date(publication.created_at).toLocaleDateString()}
          </p>
        </div>

        {publication.photo_credits && (
          <p className="text-gray-400 text-xs">
            Photo: {publication.photo_credits}
          </p>
        )}

        <div className="text-xs font-bold text-blue-700 uppercase mt-2">
          {publication.category.toUpperCase()}
        </div>
      </div>
    </Link>
  );
};

export default CategoryPublicationCard;
