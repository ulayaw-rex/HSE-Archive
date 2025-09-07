import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";
import PublicationCard from "../../components/features/Admin/PublicationCard";
import GuestPublicationCard from "../../components/features/HomePage/GuestPublicationCard";
import type { Publication } from "../../types/Publication";

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
  const [userRole, setUserRole] = useState<"guest" | "admin">("guest");

  const [featuredArticle, setFeaturedArticle] = useState<Publication | null>(
    null
  );
  const [categoryArticles, setCategoryArticles] = useState<
    Record<string, Publication[]>
  >({});

  useEffect(() => {
    // Function to fetch all publications data
    const fetchPublicationsData = () => {
      // Fetch latest publication as featured article
      AxiosInstance.get<Publication[]>("/publications")
        .then((res) => {
          if (res.data.length > 0) {
            setFeaturedArticle(res.data[0]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch featured article", err);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 flex flex-col gap-12 pb-20">
        {/* Featured Article */}
        {featuredArticle && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
            <h2 className="text-2xl font-bold text-gray-800 p-6 border-b-2 border-green-600">
              Featured
            </h2>
            <img
              src={featuredArticle.image || ""}
              alt={featuredArticle.title || ""}
              className="w-full h-[400px] object-cover"
            />
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-3">
                {featuredArticle.title}
              </h1>
              <p className="text-gray-700 mb-2 line-clamp-3">
                {featuredArticle.body}
              </p>
              <span className="text-sm text-gray-500">
                {new Date(featuredArticle.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

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
