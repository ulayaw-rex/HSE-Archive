import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";
import GuestPublicationCard from "../../components/features/HomePage/GuestPublicationCard";
import type { Publication } from "../../types/Publication";

const categories = ["university", "local", "national", "international"];

const NewsPage: React.FC = () => {
  const [featuredArticle, setFeaturedArticle] = useState<Publication | null>(
    null
  );
  const [categoryArticles, setCategoryArticles] = useState<
    Record<string, Publication[]>
  >({});

  useEffect(() => {
    const fetchPublicationsData = () => {
      AxiosInstance.get<Publication[]>("/publications")
        .then((res) => {
          if (res.data.length > 0) {
            setFeaturedArticle(res.data[0]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch featured article", err);
        });

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

    fetchPublicationsData();

    const handlePublicationCreated = () => {
      fetchPublicationsData();
    };
    window.addEventListener("publicationCreated", handlePublicationCreated);

    const intervalId = setInterval(fetchPublicationsData, 30000);

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
      {/* Featured Article */}
      {featuredArticle && (
        <div className="relative h-[500px] w-full mb-12">
          {/* Featured Badge */}
          <div className="absolute top-4 left-8 z-10 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-bold text-lg">Featured</span>
          </div>

          {/* Image with gradient overlay */}
          <div className="absolute inset-0">
            <img
              src={featuredArticle.image || ""}
              alt={featuredArticle.title || ""}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="max-w-3xl">
                <div className="mb-4">
                  <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium uppercase">
                    {featuredArticle.category}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  {featuredArticle.title}
                </h1>
                <p className="text-gray-200 text-lg mb-4 line-clamp-2">
                  {featuredArticle.body}
                </p>
                <div className="flex items-center text-gray-300">
                  <span className="font-medium">{featuredArticle.byline}</span>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(featuredArticle.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 w-[90%]">
        {/* Category Sections */}
        {categories.map((category) => (
          <section key={category} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 pb-2 border-b-2 border-green-600 capitalize">
              {category.replace("-", " ")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryArticles[category]?.map(
                (article: Publication, index: number) => (
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

export default NewsPage;
