import React from "react";
import { Link } from "react-router-dom";
import type { Publication } from "../../../types/Publication";

interface GuestPublicationCardProps {
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

const GuestPublicationCard: React.FC<GuestPublicationCardProps> = ({
  publication,
}) => {
  const displayDate = new Date(
    publication.date_published || publication.created_at
  );

  const categoryTextColor = getCategoryTextColor(publication.category);

  return (
    <Link
      to={`/news/${publication.publication_id}`}
      className="group max-w-sm overflow-hidden bg-white dark:bg-gray-900 hover:shadow-2xl transition-all duration-500 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:-translate-y-2"
    >
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10" />

        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={publication.thumbnail || publication.image || "/placeholder.jpg"}
          alt={publication.title || "Article Image"}
          loading="lazy"
        />
      </div>

      <div className="px-6 py-4 flex flex-col flex-grow">
        <div
          className={`text-xs font-bold uppercase mb-2 tracking-wide ${categoryTextColor}`}
        >
          {publication.category}
        </div>

        <div className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
          {publication.title}
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
          {publication.body}
        </p>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-auto flex justify-between items-center">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
              {displayDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

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
                <p className="text-gray-400 dark:text-gray-500 text-[10px] mt-1">
                  {type}: <span className="font-bold italic">{name}</span>
                </p>
              );
            })()}
          </div>

          <span className="text-xs text-green-600 dark:text-green-400 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
            READ NOW →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GuestPublicationCard;
