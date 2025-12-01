import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import type { Publication } from "../../../types/Publication";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface FeaturedCarouselProps {
  articles: Publication[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ articles }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
  };

  return (
    <div className="mb-12 relative overflow-hidden">
      <Slider {...settings}>
        {articles.map((article) => (
          <div key={article.publication_id}>
            <Link
              to={`/news/${article.publication_id}`}
              className="block relative h-[70vh] w-full cursor-pointer group overflow-hidden"
            >
              <img
                src={article.image || "/placeholder-image.jpg"}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent">
                <div className="w-[90%] mx-auto px-4 h-full relative">
                  <div className="absolute top-4 left-4 z-10 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center space-x-2">
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

                  <div className="h-full flex items-end pb-16">
                    <div className="max-w-3xl">
                      <div className="mb-4">
                        <span className="bg-white text-black px-4 py-2 rounded-full text-sm font-semibold uppercase">
                          {article.category}
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        {article.title}
                      </h2>
                      <p className="text-gray-200 text-lg mb-4 line-clamp-2">
                        {article.body}
                      </p>
                      <div className="flex items-center text-gray-300">
                        <span className="font-medium">{article.byline}</span>
                        <span className="mx-2">•</span>
                        <span>
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default FeaturedCarousel;
