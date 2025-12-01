import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type { Publication } from "../../types/Publication";

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q"); // Get "?q=keyword" from URL

  const [results, setResults] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (query) {
          const response = await AxiosInstance.get(
            `/publications/search?q=${query}`
          );
          setResults(response.data);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // Re-run whenever the query in URL changes

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Results
        </h1>
        <p className="text-gray-600 mb-8">
          Showing results for{" "}
          <span className="font-bold text-green-700">"{query}"</span>
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800">
              No results found
            </h3>
            <p className="text-gray-500 mt-2">
              We couldn't find any articles matching "{query}". Try different
              keywords.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {results.map((article) => (
              <Link
                to={`/news/${article.publication_id}`}
                key={article.publication_id}
                className="block bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail (Optional) */}
                  {article.image && (
                    <div className="w-full md:w-48 h-32 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Text Content */}
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
