import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import { useQuery } from "@tanstack/react-query";
import { FaFilter, FaArrowRight } from "react-icons/fa";
import type { Publication } from "../../types/Publication";

const CATEGORIES = ["All", "News", "Sports", "Opinion", "Literary"];
const NEWS_SUBTYPES = [
  "news",
  "university",
  "local",
  "national",
  "entertainment",
  "sci-tech",
];

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, _] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  const { data: results = [], isLoading: isLoadingSearch } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query) return [];
      const res = await AxiosInstance.get(`/publications/search?q=${query}`);
      return res.data;
    },
    enabled: !!query,
  });

  const { data: suggestedArticles = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["recentPublications"],
    queryFn: async () => {
      const res = await AxiosInstance.get("/publications/recent");
      return res.data;
    },
  });

  const loading = (!!query && isLoadingSearch) || isLoadingRecent;

  const filteredAndSortedResults = useMemo(() => {
    let processed = [...results];

    if (selectedCategory !== "All") {
      processed = processed.filter((item) => {
        const itemCat = item.category?.toLowerCase() || "";
        if (selectedCategory === "News") return NEWS_SUBTYPES.includes(itemCat);
        return itemCat === selectedCategory.toLowerCase();
      });
    }

    processed.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return processed;
  }, [results, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Showing results for{" "}
            <span className="font-bold text-green-700 dark:text-green-500">"{query}"</span>
          </p>
        </div>

        {!loading && results.length > 0 && (
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <FaFilter className="text-gray-400" />
              <div className="flex gap-2 overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-green-700 dark:bg-green-600 text-white shadow-md shadow-green-900/20"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
                <div className="flex gap-6">
                  <div className="w-48 h-32 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0" />
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedResults.length === 0 ? (
          <div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm text-center border border-gray-100 dark:border-gray-800 mb-12">
              <div className="text-6xl mb-4 opacity-50 dark:opacity-20">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                No matching results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                We couldn't find anything matching "{query}"
                {selectedCategory !== "All" ? ` in ${selectedCategory}` : ""}.
              </p>
              {results.length > 0 && (
                <button
                  onClick={() => setSelectedCategory("All")}
                  className="mt-4 text-green-700 font-semibold hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {suggestedArticles.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <FaArrowRight className="text-green-600 dark:text-green-500" /> You might be
                  interested in
                </h2>
                <div className="grid gap-6">
                  {suggestedArticles.map((article: Publication) => (
                    <Link
                      to={`/news/${article.publication_id}`}
                      key={article.publication_id}
                      className="block bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 group"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {article.image && (
                          <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-wider">
                            {article.category}
                          </span>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1 mb-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                            {article.title}
                          </h2>
                          <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                            {new Date(article.created_at).toLocaleDateString()}{" "}
                            • By {article.byline}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAndSortedResults.map((article: Publication) => (
              <Link
                to={`/news/${article.publication_id}`}
                key={article.publication_id}
                className="block bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800 group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {article.image && (
                    <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-800">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-1 mb-2 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {article.body}
                    </p>
                    <div className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                      {new Date(article.created_at).toLocaleDateString()} • By{" "}
                      {article.byline}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
