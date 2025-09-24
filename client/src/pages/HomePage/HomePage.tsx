import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";
import FeaturedCarousel from "../../components/features/HomePage/FeaturedCarousel";
import PublicationCard from "../../components/features/Admin/PublicationCard";
import GuestPublicationCard from "../../components/features/HomePage/GuestPublicationCard";
import type { Publication } from "../../types/Publication";
import "../../App.css";

const categories = [
  "university",
  "local",
  "national",
  "international",
  "sci-tech",
  "sports",
];

const HomePage: React.FC = () => {
  // Simulated user role: 'guest' or 'admin'
  const [userRole] = useState<"guest" | "admin">("guest");

  const [featuredArticles, setFeaturedArticles] = useState<Publication[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<
    Record<string, Publication[]>
  >({});

  useEffect(() => {
    // Function to fetch all publications data
    const fetchPublicationsData = () => {
      // Fetch latest 3 publications for featured carousel
      AxiosInstance.get<Publication[]>("/publications")
        .then((res) => {
          setFeaturedArticles(res.data.slice(0, 3));
        })
        .catch((err) => {
          console.error("Failed to fetch featured articles", err);
        });

      // Fetch recent articles for each category
      categories.forEach((category) => {
        AxiosInstance.get<Publication[]>(`/publications/category/${category}`)
          .then((res) => {
            setCategoryArticles((prev) => ({
              ...prev,
              [category]: res.data.slice(0, 4), // take 4 recent articles
            }));
          })
          .catch((err) => {
            console.error(
              `Failed to fetch articles for category ${category}`,
              err
            );
          });
      });
    };

    // Initial fetch
    fetchPublicationsData();

    // Listen for publicationCreated event to refresh immediately
    const handlePublicationCreated = () => {
      fetchPublicationsData();
    };
    window.addEventListener("publicationCreated", handlePublicationCreated);

    // Set interval to refresh data every 30 seconds
    const intervalId = setInterval(fetchPublicationsData, 30000);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener(
        "publicationCreated",
        handlePublicationCreated
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Featured Carousel */}
      {featuredArticles.length > 0 && (
        <FeaturedCarousel articles={featuredArticles} />
      )}

      <div className="container mx-auto px-4">
        {/* Category Sections */}
        {categories.map((category) => (
          <section key={category} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 pb-2 border-b-2 border-green-600 capitalize">
              {category.replace("-", " ")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        ))}
      </div>
    </div>
  );
};

export default HomePage;
