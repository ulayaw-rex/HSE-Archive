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
      className="group max-w-sm overflow-hidden bg-white hover:shadow-xl transition-all duration-300 rounded-lg border border-gray-100 flex flex-col h-full hover:-translate-y-1"
    >
      <div className="w-full h-48 bg-gray-200 shrink-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-10" />

        {publication.image ? (
          <img
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={publication.image}
            alt={publication.title || "Article Image"}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl opacity-20">📰</span>
          </div>
        )}
      </div>

      <div className="px-6 py-4 flex flex-col flex-grow">
        <div
          className={`text-xs font-bold uppercase mb-2 tracking-wide ${categoryTextColor}`}
        >
          {publication.category}
        </div>

        <div className="font-bold text-xl mb-2 text-gray-900 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">
          {publication.title}
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {publication.body}
        </p>

        <div className="border-t border-gray-100 pt-3 mt-auto flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-xs font-medium">
              {displayDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {publication.photo_credits && (
              <p className="text-gray-400 text-[10px] mt-1 italic">
                Photo: {publication.photo_credits}
              </p>
            )}
          </div>

          <span className="text-xs text-green-600 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
            READ NOW →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GuestPublicationCard;
