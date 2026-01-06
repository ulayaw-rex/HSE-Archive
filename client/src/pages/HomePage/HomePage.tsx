import React, { useState, useCallback, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";
import { Link } from "react-router-dom";
import FeaturedCarousel from "../../components/features/HomePage/FeaturedCarousel";
import PublicationCard from "../../components/features/Admin/PublicationCard";
import GuestPublicationCard from "../../components/features/HomePage/GuestPublicationCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type { Publication } from "../../types/Publication";
import "../../App.css";
import { useDataCache } from "../../context/DataContext";
import { usePolling } from "../../hooks/usePolling";

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

const HomePage: React.FC = () => {
  const [userRole] = useState<"guest" | "admin">("guest");
  const { cache, updateCache } = useDataCache();

  const [featuredArticles, setFeaturedArticles] = useState<Publication[]>(
    cache.home?.featured || []
  );
  const [categoryArticles, setCategoryArticles] = useState<
    Record<string, Publication[]>
  >(cache.home?.categories || {});

  const [loading, setLoading] = useState(!cache.home);

  const fetchPublicationsData = useCallback(async () => {
    try {
      const response = await AxiosInstance.get("/home-data");

      const { featured, categories } = response.data;

      setFeaturedArticles(featured);
      setCategoryArticles(categories);

      updateCache("home", {
        featured: featured,
        categories: categories,
      });
    } catch (err) {
      console.error("Failed to fetch homepage data", err);
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  usePolling(fetchPublicationsData, 60000);

  useEffect(() => {
    fetchPublicationsData();

    const handlePublicationCreated = () => {
      fetchPublicationsData();
    };

    window.addEventListener("publicationCreated", handlePublicationCreated);
    return () => {
      window.removeEventListener(
        "publicationCreated",
        handlePublicationCreated
      );
    };
  }, [fetchPublicationsData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      {featuredArticles.length > 0 && (
        <FeaturedCarousel articles={featuredArticles} />
      )}

      <div className="w-[90%] mx-auto px-4">
        {categories.map((category) =>
          categoryArticles[category]?.length > 0 ? (
            <section key={category} className="space-y-6 mt-12">
              <div className="flex items-center justify-between border-b-2 border-green-600/20 pb-2">
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                  {category.replace("-", " ")}
                </h2>

                <Link
                  to={`/news/${category}`}
                  className="group flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-900 transition-colors uppercase tracking-wider"
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
                    )
                )}
              </div>
            </section>
          ) : null
        )}
      </div>
    </div>
  );
};

export default HomePage;
