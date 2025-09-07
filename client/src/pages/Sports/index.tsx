import React, { useEffect, useState } from "react";
import AxiosInstance from "../../AxiosInstance";
import CategoryPublicationCard from "../../components/features/CategoryPublicationCard";
import FeaturedPublicationCard from "../../components/features/FeaturedPublicationCard";
import type { Publication } from "../../types/Publication";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SportsPage: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await AxiosInstance.get(
          "/publications/category/sports"
        );
        setPublications(response.data);
      } catch (err) {
        console.error("Failed to fetch sports publications:", err);
        setError("Failed to load sports publications.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  const handleEdit = (publication: Publication) => {
    // Placeholder for edit action
    console.log("Edit publication", publication);
  };

  const handleDelete = (id: number) => {
    // Placeholder for delete action
    console.log("Delete publication with id", id);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  const [featured, ...others] = publications;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 space-y-6">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Sports</h1>
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

export default SportsPage;
