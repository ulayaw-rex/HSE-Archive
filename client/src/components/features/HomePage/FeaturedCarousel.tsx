import React from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { Publication } from "../../../types/Publication";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="absolute left-0 top-0 bottom-0 w-[10%] z-20 flex items-center justify-start pl-4 cursor-pointer group/arrow hover:bg-gradient-to-r hover:from-black/40 hover:to-transparent transition-all duration-500"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/10 text-white opacity-0 group-hover/arrow:opacity-100 transform -translate-x-8 group-hover/arrow:translate-x-0 transition-all duration-500 ease-out">
        <FaChevronLeft size={18} />
      </div>
    </div>
  );
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-[10%] z-20 flex items-center justify-end pr-4 cursor-pointer group/arrow hover:bg-gradient-to-l hover:from-black/40 hover:to-transparent transition-all duration-500"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/10 text-white opacity-0 group-hover/arrow:opacity-100 transform translate-x-8 group-hover/arrow:translate-x-0 transition-all duration-500 ease-out">
        <FaChevronRight size={18} />
      </div>
    </div>
  );
};

interface FeaturedCarouselProps {
  articles: Publication[];
}

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
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 7000,
    fade: false,
    cssEase: "cubic-bezier(0.25, 1, 0.5, 1)",
    waitForAnimate: false,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    appendDots: (dots: any) => (
      <div style={{ bottom: "30px", zIndex: 30 }}>
        <ul className="m-0 p-0 flex justify-center gap-2"> {dots} </ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-12 h-1 bg-white/30 rounded-full transition-all duration-500 hover:bg-white/80 cursor-pointer" />
    ),
  };

  if (articles.length === 0) return null;

  return (
    <div className="mb-12 relative overflow-hidden shadow-2xl group bg-black">
      <style>{`
        .slick-dots li.slick-active div {
          background-color: #fff !important;
          width: 3rem !important;
        }
        @keyframes slowZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes slideUpFade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .slick-active .animate-slowZoom {
          animation: slowZoom 10s ease-out forwards;
        }
        .slick-active .animate-reveal-1 {
          animation: slideUpFade 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
          animation-delay: 0.3s;
          opacity: 0;
        }
        .slick-active .animate-reveal-2 {
          animation: slideUpFade 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
          animation-delay: 0.4s;
          opacity: 0;
        }
        .slick-active .animate-reveal-3 {
          animation: slideUpFade 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>

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
              className="relative h-[80vh] w-full outline-none overflow-hidden"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={article.image || "/placeholder-image.jpg"}
                  alt={article.title}
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
                          className={`bg-white px-3 py-1 text-[10px] md:text-xs font-black uppercase tracking-[0.25em] shadow-xl ${categoryTextColor}`}
                        >
                          {article.category}
                        </span>
                        <div className="h-px w-20 bg-white/40 hidden md:block"></div>
                      </div>
                    </div>

                    <div className="animate-reveal-2">
                      <Link
                        to={`/news/${article.publication_id}`}
                        className="group/title block"
                      >
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-[1.1] drop-shadow-2xl group-hover/title:text-green-400 transition-colors duration-300 w-full">
                          {article.title}
                        </h2>
                      </Link>

                      <p className="text-gray-200 text-base md:text-lg font-light mb-6 line-clamp-2 w-full leading-relaxed drop-shadow-lg opacity-90">
                        {article.body}
                      </p>
                    </div>

                    <div className="animate-reveal-3 flex flex-wrap items-center gap-4 text-sm font-medium tracking-wide">
                      <div className="flex items-center text-white/90 border-l-2 border-green-500 pl-3 h-8">
                        <span className="uppercase tracking-widest text-[10px] md:text-xs font-bold">
                          {writerNames}
                        </span>
                      </div>

                      <span className="text-gray-400 uppercase tracking-widest text-[10px]">
                        {displayDate.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>

                      <Link
                        to={`/news/${article.publication_id}`}
                        className="ml-auto px-6 py-2 bg-white text-black hover:bg-green-600 hover:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] hover:-translate-y-0.5"
                      >
                        Read Story
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default FeaturedCarousel;
