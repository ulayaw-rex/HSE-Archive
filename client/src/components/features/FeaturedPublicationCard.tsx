import React from "react";
import type { Publication } from "../../types/Publication";

interface FeaturedPublicationCardProps {
  publication: Publication;
}

const FeaturedPublicationCard: React.FC<FeaturedPublicationCardProps> = ({
  publication,
}) => {
  return (
    <div className="featured-publication-card rounded-lg shadow-md overflow-hidden bg-white">
      {publication.image && (
        <img
          src={publication.image}
          alt={publication.title}
          className="w-full h-64 object-cover"
        />
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-green-800 mb-2">
          {publication.title}
        </h2>
        {publication.created_at && (
          <p className="text-sm text-gray-600 mb-4">
            {new Date(publication.created_at).toLocaleDateString()}
          </p>
        )}
        <p className="text-base text-gray-800">{publication.byline}</p>
        {publication.photo_credits && (
          <p className="text-sm text-gray-600 mt-2">
            Photo: {publication.photo_credits}
          </p>
        )}
      </div>
    </div>
  );
};

export default FeaturedPublicationCard;
