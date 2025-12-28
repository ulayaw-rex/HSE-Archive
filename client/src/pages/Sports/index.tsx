import React, { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";
import CategoryPublicationCard from "../../components/features/Categories/CategoryPublicationCard";
import FeaturedPublicationCard from "../../components/features/Categories/FeaturedPublicationCard";
import type { Publication } from "../../types/Publication";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useDataCache } from "../../context/DataContext";

const SportsPage: React.FC = () => {
  const { cache, updateCache } = useDataCache();

  const [publications, setPublications] = useState<Publication[]>(
    cache.sports || []
  );

  const [loading, setLoading] = useState(!cache.sports);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cache.sports) {
      const fetchPublications = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await AxiosInstance.get(
            "/publications/category/sports"
          );
          setPublications(response.data);

          updateCache("sports", response.data);
        } catch (err) {
          console.error("Failed to fetch sports publications:", err);
          setError("Failed to load sports publications.");
        } finally {
          setLoading(false);
        }
      };

      fetchPublications();
    } else {
      setLoading(false);
    }
  }, [cache.sports, updateCache]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">
        {error}
      </div>
    );
  }

  const [featured, ...others] = publications;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6 w-[90%]">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 uppercase">
          Sports
        </h1>

        {publications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No sports articles found.
          </div>
        ) : (
          <>
            {featured && <FeaturedPublicationCard publication={featured} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {others.map((publication) => (
                <CategoryPublicationCard
                  key={publication.publication_id}
                  publication={publication}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SportsPage;
