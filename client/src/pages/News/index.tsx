import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import GuestPublicationCard from "../../components/features/HomePage/GuestPublicationCard";
import type { Publication } from "../../types/Publication";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useDataCache } from "../../context/DataContext";
import { usePolling } from "../../hooks/usePolling";

const categories = ["university", "local", "national", "international"];

const getCategoryTextColor = (category: string) => {
  const lowerCat = category.toLowerCase();
  switch (lowerCat) {
    case "university":
      return "text-green-600";
    case "local":
      return "text-blue-600";
    case "national":
      return "text-red-600";
    case "entertainment":
      return "text-purple-600";
    case "sci-tech":
      return "text-indigo-600";
    case "sports":
      return "text-orange-500";
    case "opinion":
      return "text-teal-600";
    case "literary":
      return "text-pink-600";
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

  const fetchAllData = useCallback(async () => {
    try {
      if (!featuredArticle) setLoading(true);

      const response = await AxiosInstance.get("/publications/news-hub");
      const { featured, categories: newCategoryData } = response.data;

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
  }, [updateCache, featuredArticle]);

  usePolling(fetchAllData, 60000);

  useEffect(() => {
    if (!cache.newsHub) {
      fetchAllData();
    }

    const handlePublicationCreated = () => fetchAllData();
    window.addEventListener("publicationCreated", handlePublicationCreated);
    return () =>
      window.removeEventListener(
        "publicationCreated",
        handlePublicationCreated
      );
  }, [fetchAllData, cache.newsHub]);

  if (loading && !featuredArticle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 animate-in fade-in duration-500">
      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slowZoom {
          animation: slowZoom 10s ease-out forwards;
        }
        .animate-reveal-1 {
          animation: slideUpFade 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
          animation-delay: 0.3s;
          opacity: 0;
        }
        .animate-reveal-2 {
          animation: slideUpFade 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
          animation-delay: 0.4s;
          opacity: 0;
        }
        .animate-reveal-3 {
          animation: slideUpFade 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>

      {featuredArticle && (
        <div className="relative h-[80vh] w-full outline-none overflow-hidden mb-16 shadow-2xl bg-black group">
          <div className="absolute inset-0 z-0">
            <img
              src={featuredArticle.image || "/placeholder-image.jpg"}
              alt={featuredArticle.title}
              className="w-full h-full object-cover animate-slowZoom origin-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40"></div>
          </div>

          <div className="absolute inset-0 z-10 flex items-end pb-24 pointer-events-none">
            <div className="w-full mx-auto px-6 md:px-12 relative z-20">
              <div className="w-full pointer-events-auto">
                <div className="mb-4 animate-reveal-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`bg-white px-3 py-1 text-[10px] md:text-xs font-black uppercase tracking-[0.25em] shadow-xl ${getCategoryTextColor(
                        featuredArticle.category
                      )}`}
                    >
                      {featuredArticle.category}
                    </span>
                    <div className="h-px w-20 bg-white/40 hidden md:block"></div>
                  </div>
                </div>

                <div className="animate-reveal-2">
                  <Link
                    to={`/news/${featuredArticle.publication_id}`}
                    className="group/title block"
                  >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-[1.1] drop-shadow-2xl group-hover/title:text-green-400 transition-colors duration-300 w-full">
                      {featuredArticle.title}
                    </h2>
                  </Link>

                  <p className="text-gray-200 text-base md:text-lg font-light mb-6 line-clamp-2 w-full leading-relaxed drop-shadow-lg opacity-90">
                    {featuredArticle.body}
                  </p>
                </div>

                <div className="animate-reveal-3 flex flex-wrap items-center gap-4 text-sm font-medium tracking-wide">
                  <div className="flex items-center text-white/90 border-l-2 border-green-500 pl-3 h-8">
                    <span className="uppercase tracking-widest text-[10px] md:text-xs font-bold">
                      {featuredArticle.byline}
                    </span>
                  </div>

                  <span className="text-gray-400 uppercase tracking-widest text-[10px]">
                    {new Date(featuredArticle.created_at).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>

                  <Link
                    to={`/news/${featuredArticle.publication_id}`}
                    className="ml-auto px-6 py-2 bg-white text-black hover:bg-green-600 hover:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:-translate-y-0.5"
                  >
                    Read Story
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 w-[90%]">
        {categories.map((category) => {
          const articles = categoryArticles[category];

          if (!articles || articles.length === 0) return null;

          return (
            <section key={category} className="space-y-8 mb-20">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                <div
                  className={`h-8 w-2 rounded-full ${getCategoryTextColor(
                    category
                  ).replace("text-", "bg-")}`}
                ></div>
                <h2 className="text-3xl font-black text-gray-900 capitalize tracking-tight">
                  {category.replace("-", " ")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
