import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import GuestPublicationCard from "../../components/features/HomePage/GuestPublicationCard";
import type { Publication } from "../../types/Publication";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useDataCache } from "../../context/DataContext";

const categories = ["university", "local", "national", "international"];

const getCategoryTextColor = (category: string) => {
  const lowerCat = category.toLowerCase();
  switch (lowerCat) {
    case "university":
      return "text-green-700";
    case "local":
      return "text-blue-700";
    case "national":
      return "text-red-700";
    case "entertainment":
      return "text-purple-700";
    case "sci-tech":
      return "text-indigo-700";
    case "sports":
      return "text-orange-600";
    case "opinion":
      return "text-teal-700";
    case "literary":
      return "text-pink-700";
    default:
      return "text-gray-800";
  }
};

const NewsPage: React.FC = () => {
  const { cache, updateCache } = useDataCache();

  const [featuredArticle, setFeaturedArticle] = useState<Publication | null>(
    cache.newsHub?.featured || null
  );
  const [categoryArticles, setCategoryArticles] = useState<
    Record<string, Publication[]>
  >(cache.newsHub?.categories || {});

  const [loading, setLoading] = useState(!cache.newsHub);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const mainPromise = AxiosInstance.get<Publication[]>("/publications");

        const categoryPromises = categories.map((cat) =>
          AxiosInstance.get<Publication[]>(`/publications/category/${cat}`)
        );

        const [mainRes, ...categoryResponses] = await Promise.all([
          mainPromise,
          ...categoryPromises,
        ]);

        const featured = mainRes.data.length > 0 ? mainRes.data[0] : null;

        const newCategoryData: Record<string, Publication[]> = {};
        categoryResponses.forEach((res, index) => {
          const categoryName = categories[index];
          newCategoryData[categoryName] = res.data.slice(0, 4);
        });

        setFeaturedArticle(featured);
        setCategoryArticles(newCategoryData);

        updateCache("newsHub", {
          featured: featured,
          categories: newCategoryData,
        });
      } catch (error) {
        console.error("Failed to fetch news data", error);
      } finally {
        setLoading(false);
      }
    };

    if (!cache.newsHub) {
      fetchAllData();
    } else {
      setLoading(false);
    }

    const handlePublicationCreated = () => {
      fetchAllData();
    };
    window.addEventListener("publicationCreated", handlePublicationCreated);

    const intervalId = setInterval(fetchAllData, 30000);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener(
        "publicationCreated",
        handlePublicationCreated
      );
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-12">
      {featuredArticle && (
        <div className="relative h-[70vh] w-full mb-12 group overflow-hidden">
          <Link
            to={`/news/${featuredArticle.publication_id}`}
            className="block h-full w-full cursor-pointer"
          >
            <div className="absolute inset-0">
              <img
                src={featuredArticle.image || ""}
                alt={featuredArticle.title || ""}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 pb-16 md:pb-20">
              <div className="container mx-auto w-[90%]">
                <div className="max-w-4xl">
                  <div className="mb-4">
                    <span
                      className={`inline-block bg-white px-4 py-1.5 rounded-md text-xs md:text-sm font-extrabold uppercase tracking-widest shadow-lg ${getCategoryTextColor(
                        featuredArticle.category
                      )}`}
                    >
                      {featuredArticle.category}
                    </span>
                  </div>

                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                    {featuredArticle.title}
                  </h1>

                  <p className="text-gray-200 text-lg md:text-xl mb-6 line-clamp-2 drop-shadow-md max-w-2xl opacity-90">
                    {featuredArticle.body}
                  </p>

                  <div className="flex items-center text-gray-300 font-medium text-sm md:text-base border-l-4 border-green-600 pl-4">
                    <span className="text-white">{featuredArticle.byline}</span>
                    <span className="mx-3 text-white/40">•</span>
                    <span className="text-gray-400 uppercase tracking-wide text-xs">
                      {new Date(featuredArticle.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
      <div className="container mx-auto px-4 w-[90%]">
        {categories.map((category) => {
          const articles = categoryArticles[category];

          if (!articles || articles.length === 0) return null;

          return (
            <section key={category} className="space-y-6 mb-12">
              <div className="flex items-center justify-between border-b-2 border-green-600/20 pb-2">
                <h2 className="text-2xl font-bold text-green-900 capitalize flex items-center gap-2">
                  {category.replace("-", " ")} News
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {articles.map((article: Publication, index: number) => (
                  <GuestPublicationCard key={index} publication={article} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default NewsPage;
