import React, { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";
import CategoryPublicationCard from "../../components/features/Categories/CategoryPublicationCard";
import FeaturedPublicationCard from "../../components/features/Categories/FeaturedPublicationCard";
import type { Publication } from "../../types/Publication";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const LiteraryPage: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AxiosInstance.get(
          "/publications/category/literary"
        );
        setPublications(response.data);
      } catch (err) {
        console.error("Failed to fetch literary publications:", err);
        setError("Failed to load literary publications.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  const [featured, ...others] = publications;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Literary</h1>
        {featured && <FeaturedPublicationCard publication={featured} />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {others.map((publication) => (
            <CategoryPublicationCard
              key={publication.publication_id}
              publication={publication}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiteraryPage;
