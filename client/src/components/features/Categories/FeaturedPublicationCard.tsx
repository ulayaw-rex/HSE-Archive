import React from "react";
import { Link } from "react-router-dom";
import type { Publication } from "../../../types/Publication";

interface FeaturedPublicationCardProps {
  publication: Publication;
}

const FeaturedPublicationCard: React.FC<FeaturedPublicationCardProps> = ({
  publication,
}) => {
  return (
    <Link
      to={`/news/${publication.publication_id}`}
      className="featured-publication-card group block relative h-[500px] w-full overflow-hidden rounded-lg"
    >
      <div className="absolute inset-0">
        <img
          src={publication.image || "/placeholder-image.jpg"}
          alt={publication.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">
          {publication.title}
        </h2>
        <p className="text-gray-200 text-lg mb-4 line-clamp-2 w-150">
          {publication.body}
        </p>
        <p className="text-gray-200 mb-4 line-clamp-2">{publication.byline}</p>

        <div className="flex items-center justify-between text-gray-300 text-sm">
          <div className="flex items-center">
            {publication.photo_credits && (
              <span className="mr-3">Photo: {publication.photo_credits}</span>
            )}
            <span>{new Date(publication.created_at).toLocaleDateString()}</span>
          </div>

          <span className="text-green-400 font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
            READ NOW →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedPublicationCard;
