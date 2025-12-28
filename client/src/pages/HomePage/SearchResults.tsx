import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
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

  const [results, setResults] = useState<Publication[]>([]);
  // 1. New State for Suggestions
  const [suggestedArticles, setSuggestedArticles] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, _] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  // 2. Fetch Search Results AND Suggestions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch Search Results
        if (query) {
          const searchRes = await AxiosInstance.get(
            `/publications/search?q=${query}`
          );
          setResults(searchRes.data);
        }

        // Fetch Suggestions (Recent articles) independently
        // This ensures we have them ready if search comes back empty
        const recentRes = await AxiosInstance.get("/publications/recent");
        setSuggestedArticles(recentRes.data);
      } catch (error) {
        console.error("Data fetch failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search Results
          </h1>
          <p className="text-gray-600">
            Showing results for{" "}
            <span className="font-bold text-green-700">"{query}"</span>
          </p>
        </div>

        {/* Filter Controls (Only show if we actually have results) */}
        {!loading && results.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* ... (Keep your existing filter/sort buttons here) ... */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <FaFilter className="text-gray-400" />
              <div className="flex gap-2 overflow-x-auto">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-green-700 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredAndSortedResults.length === 0 ? (
          // === 3. MODIFIED NO RESULTS VIEW ===
          <div>
            <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100 mb-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800">
                No matching results found
              </h3>
              <p className="text-gray-500 mt-2">
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

            {/* Suggestions Section */}
            {suggestedArticles.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaArrowRight className="text-green-600" /> You might be
                  interested in
                </h2>
                <div className="grid gap-6">
                  {suggestedArticles.map((article) => (
                    <Link
                      to={`/news/${article.publication_id}`}
                      key={article.publication_id}
                      className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {article.image && (
                          <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                            {article.category}
                          </span>
                          <h2 className="text-xl font-bold text-gray-900 mt-1 mb-2 group-hover:text-green-700 transition-colors">
                            {article.title}
                          </h2>
                          <div className="mt-3 text-xs text-gray-400">
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
          // === 4. NORMAL RESULTS VIEW ===
          <div className="grid gap-6">
            {filteredAndSortedResults.map((article) => (
              <Link
                to={`/news/${article.publication_id}`}
                key={article.publication_id}
                className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {article.image && (
                    <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                      {article.category}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-1 mb-2 group-hover:text-green-700 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {article.body}
                    </p>
                    <div className="mt-3 text-xs text-gray-400">
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
