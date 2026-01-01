import React, { useState, useCallback } from "react";
import AxiosInstance from "../../AxiosInstance";
import CategoryPublicationCard from "../../components/features/Categories/CategoryPublicationCard";
import FeaturedPublicationCard from "../../components/features/Categories/FeaturedPublicationCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type { Publication } from "../../types/Publication";
import { useDataCache } from "../../context/DataContext";
import { usePolling } from "../../hooks/usePolling";

const NationalNewsPage: React.FC = () => {
  const { cache, updateCache } = useDataCache();

  const [publications, setPublications] = useState<Publication[]>(
    cache.national || []
  );

  const [loading, setLoading] = useState(!cache.national);
  const [error, setError] = useState<string | null>(null);
  const fetchPublications = useCallback(async () => {
    try {
      const response = await AxiosInstance.get(
        "/publications/category/national"
      );

      setPublications(response.data);
      updateCache("national", response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch national publications:", err);
      if (publications.length === 0) {
        setError("Failed to load national publications.");
      }
    } finally {
      setLoading(false);
    }
  }, [updateCache, publications.length]);

  usePolling(fetchPublications, 60000);

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
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">NATIONAL</h1>

        {publications.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No national news found.
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

export default NationalNewsPage;
