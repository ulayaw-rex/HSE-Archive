import React from "react";
import { useParams } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { useQuery } from "@tanstack/react-query";
import CategoryPublicationCard from "../../components/features/Categories/CategoryPublicationCard";
import FeaturedPublicationCard from "../../components/features/Categories/FeaturedPublicationCard";
import { Skeleton, ArticleSkeleton, FeaturedSkeleton } from "../../components/common/Skeleton";
import EmptyState from "../../components/common/EmptyState";
import type { Publication } from "../../types/Publication";

const DynamicCategoryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();

  const fetchPublications = async () => {
    if (!category) throw new Error("Category missing");
    const response = await AxiosInstance.get(`/publications/category/${category}`);
    return response.data;
  };

  const { data: publications = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ["category", category],
    queryFn: fetchPublications,
    enabled: !!category,
  });

  const error = queryError ? `Failed to load ${category} publications.` : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
        <div className="container mx-auto px-4 space-y-6 w-[90%]">
          <Skeleton className="w-64 h-10 mb-6 bg-gray-200 dark:bg-gray-700" />
          <FeaturedSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <ArticleSkeleton />
            <ArticleSkeleton />
          </div>
        </div>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="container mx-auto px-4 space-y-6 w-[90%] text-gray-900 dark:text-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 uppercase">
          {category?.replace("-", " ")}
        </h1>
        {publications.length === 0 ? (
           <div className="py-12 capitalize">
            <EmptyState 
              title={`No ${category} News`} 
              message="Check back later for updates." 
            />
           </div>
        ) : (
          <>
            {featured && <FeaturedPublicationCard publication={featured} />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {others.map((publication: Publication) => (
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

export default DynamicCategoryPage;
