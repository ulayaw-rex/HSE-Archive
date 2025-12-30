import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import type { Publication } from "../../../types/Publication";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface FeaturedCarouselProps {
  articles: Publication[];
}

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

const getArticleWriters = (article: Publication) => {
  if (article.writers && article.writers.length > 0) {
    return article.writers.map((w) => w.name).join(" & ");
  }
  return article.byline || "The Technovator";
};

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ articles }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    arrows: true,
    fade: true,
  };

  if (articles.length === 0) return null;

  return (
    <div className="mb-12 relative overflow-hidden shadow-2xl group">
      <Slider {...settings}>
        {articles.map((article) => {
          const displayDate = new Date(
            article.date_published || article.created_at
          );
          const categoryTextColor = getCategoryTextColor(article.category);

          const writerNames = getArticleWriters(article);

          return (
            <div
              key={article.publication_id}
              className="relative h-[70vh] w-full outline-none"
            >
              <Link
                to={`/news/${article.publication_id}`}
                className="block h-full w-full cursor-pointer"
              >
                <div className="absolute inset-0">
                  <img
                    src={article.image || "/placeholder-image.jpg"}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>

                <div className="w-[90%] mx-auto px-4 h-full relative">
                  <div className="h-full flex items-end pb-16">
                    <div className="max-w-3xl">
                      <div className="mb-4">
                        <span
                          className={`inline-block bg-white px-4 py-1.5 rounded-md text-xs font-extrabold uppercase tracking-widest shadow-lg ${categoryTextColor}`}
                        >
                          {article.category}
                        </span>
                      </div>

                      <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
                        {article.title}
                      </h2>

                      <p className="text-gray-200 text-lg md:text-xl mb-6 line-clamp-2 drop-shadow-md opacity-90">
                        {article.body}
                      </p>

                      <div className="flex items-center text-gray-300 font-medium text-sm md:text-base border-l-4 border-green-600 pl-4">
                        <span className="text-white">{writerNames}</span>

                        <span className="mx-3 text-white/40">•</span>

                        <span className="text-gray-400 uppercase tracking-wide text-xs">
                          {displayDate.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default FeaturedCarousel;
