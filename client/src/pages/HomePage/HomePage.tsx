import React, { useState, useEffect, Suspense } from "react";
import AxiosInstance from "../../AxiosInstance";
import { Link } from "react-router-dom";

// Lazy-load carousel — defers react-slick (~80KB) until after initial render
const FeaturedCarousel = React.lazy(
  () => import("../../components/features/HomePage/FeaturedCarousel")
);
import PublicationCard from "../../components/features/Admin/PublicationCard";
import GuestPublicationCard from "../../components/features/HomePage/GuestPublicationCard";
import { Skeleton, ArticleSkeleton, FeaturedSkeleton } from "../../components/common/Skeleton";
import type { Publication } from "../../types/Publication";
import "../../App.css";
import { useQuery } from "@tanstack/react-query";

const categories = [
  "university",
  "local",
  "national",
  "entertainment",
  "sci-tech",
  "sports",
  "opinion",
  "literary",
];

const getCategoryColor = (category: string) => {
  const lowerCat = category.toLowerCase();
  switch (lowerCat) {
    case "university":
      return "bg-green-600";
    case "local":
      return "bg-blue-600";
    case "national":
      return "bg-red-600";
    case "entertainment":
      return "bg-purple-600";
    case "sci-tech":
      return "bg-indigo-600";
    case "sports":
      return "bg-orange-500";
    case "opinion":
      return "bg-teal-600";
    case "literary":
      return "bg-pink-600";
    default:
      return "bg-gray-800";
  }
};

const HomePage: React.FC = () => {
  const [userRole] = useState<"guest" | "admin">("guest");
  const fetchHomeData = async () => {
    const response = await AxiosInstance.get("/home-data");
    return response.data;
  };

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ["homeData"],
    queryFn: fetchHomeData,
    // Polls every 15s so new published articles appear without a manual refresh.
    // Server returns cached data (5 min TTL) so DB load stays low.
    refetchInterval: 15_000,
  });

  const featuredArticles = data?.featured || [];
  const categoryArticles = data?.categories || {};

  useEffect(() => {
    const handlePublicationCreated = () => refetch();
    window.addEventListener("publicationCreated", handlePublicationCreated);
    return () => {
      window.removeEventListener("publicationCreated", handlePublicationCreated);
    };
  }, [refetch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 pb-12 transition-colors duration-200">
        <FeaturedSkeleton />
        <div className="w-[90%] mx-auto px-4 mt-12 space-y-12">
          {categories.slice(0, 3).map((category) => (
            <section key={category} className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                 <Skeleton className="w-48 h-8 bg-gray-200 dark:bg-gray-700" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {[1, 2, 3, 4].map(key => <ArticleSkeleton key={key} />)}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-12 transition-colors duration-200">
      {featuredArticles.length > 0 && (
        <Suspense fallback={<FeaturedSkeleton />}>
          <FeaturedCarousel articles={featuredArticles} />
        </Suspense>
      )}

      <div className="w-[90%] mx-auto px-4">
        {categories.map((category) =>
          categoryArticles[category]?.length > 0 ? (
            <section key={category} className="space-y-6 mt-12">
              <div className="flex items-center justify-between border-b-2 border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-2 rounded-full ${getCategoryColor(
                      category,
                    )}`}
                  ></div>

                  <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 capitalize tracking-tight">
                    {category.replace("-", " ")}
                  </h2>
                </div>

                <Link
                  to={`/category/${category}`}
                  className="group flex items-center gap-1 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-400 transition-colors uppercase tracking-wider"
                >
                  See More
                  <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-5">
                {categoryArticles[category]?.map(
                  (article: Publication, index: number) =>
                    userRole === "admin" ? (
                      <PublicationCard
                        key={index}
                        publication={article}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ) : (
                      <GuestPublicationCard key={index} publication={article} />
                    ),
                )}
              </div>
            </section>
          ) : null,
        )}
      </div>
    </div>
  );
};

export default HomePage;
