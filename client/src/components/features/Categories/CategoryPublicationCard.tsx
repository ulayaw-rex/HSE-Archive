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
      return "text-green-700 dark:text-green-400";
    case "local":
      return "text-blue-700 dark:text-blue-400";
    case "national":
      return "text-red-700 dark:text-red-400";
    case "entertainment":
      return "text-purple-700 dark:text-purple-400";
    case "sci-tech":
      return "text-indigo-700 dark:text-indigo-400";
    case "sports":
      return "text-orange-600 dark:text-orange-400";
    case "opinion":
      return "text-teal-700 dark:text-teal-400";
    case "literary":
      return "text-pink-700 dark:text-pink-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

const CategoryPublicationCard: React.FC<CategoryPublicationCardProps> = ({
  publication,
}) => {
  const categoryColor = getCategoryTextColor(publication.category);

  return (
    <Link
      to={`/news/${publication.publication_id}`}
      className="group flex bg-white dark:bg-gray-800/80 dark:backdrop-blur-sm rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all duration-500 border border-transparent dark:border-gray-700/50 hover:-translate-y-2"
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
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
            {publication.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
            {publication.body}
          </p>

          <p className="text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">
            By {publication.byline}
          </p>

          <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">
            {new Date(publication.created_at).toLocaleDateString()}
          </p>
        </div>

        {publication.photo_credits && (() => {
          const credits = publication.photo_credits;
          let type = "Photo";
          let name = credits;
          if (credits.startsWith("Photo ")) {
            type = "Photo";
            name = credits.substring(6);
          } else if (credits.startsWith("Art ")) {
            type = "Art";
            name = credits.substring(4);
          } else if (credits.startsWith("Cartoon ")) {
            type = "Cartoon";
            name = credits.substring(8);
          }
          return (
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              {type}: <span className="font-bold italic">{name}</span>
            </p>
          );
        })()}

        <div className="mt-2 flex items-center justify-between">
          <div className={`text-xs font-bold uppercase ${categoryColor}`}>
            {publication.category.toUpperCase()}
          </div>

          <span className="text-xs text-green-600 dark:text-green-400 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
            READ NOW →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CategoryPublicationCard;
