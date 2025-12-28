import React from "react";
import type { Publication } from "../../../types/Publication";
import { Link } from "react-router-dom";

interface CategoryPublicationCardProps {
  publication: Publication;
}

const getCategoryTextColor = (category: string) => {
  const lowerCat = category.toLowerCase();
  switch (lowerCat) {
    case "university":
      return "text-green-700";
    case "local":
      return "text-blue-700";
    case "national":
      return "text-red-700";
    case "entertainment":
      return "text-purple-700";
    case "sci-tech":
      return "text-indigo-700";
    case "sports":
      return "text-orange-600";
    case "opinion":
      return "text-teal-700";
    case "literary":
      return "text-pink-700";
    default:
      return "text-gray-600";
  }
};

const CategoryPublicationCard: React.FC<CategoryPublicationCardProps> = ({
  publication,
}) => {
  const categoryColor = getCategoryTextColor(publication.category);

  return (
    <Link
      to={`/news/${publication.publication_id}`}
      className="group flex bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
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
          <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors">
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

        <div className="mt-2 flex items-center justify-between">
          <div className={`text-xs font-bold uppercase ${categoryColor}`}>
            {publication.category.toUpperCase()}
          </div>

          <span className="text-xs text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
            READ NOW →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryPublicationCard;
