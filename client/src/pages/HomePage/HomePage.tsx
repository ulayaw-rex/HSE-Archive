import React, { useState, useEffect, useRef } from "react";

// Types
type Article = {
  id: number;
  image: string;
  headline: string;
  date: string;
  excerpt: string;
};

type OpinionArticle = Article & {
  tag: string;
};

type SportsArticle = Article & {
  category: string;
};

// Mock data
const newsArticles: Article[] = [
  {
    id: 1,
    image: "https://via.placeholder.com/400x250/4a90e2/ffffff?text=News+Image+1",
    headline: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    date: "July 23, 2025",
    excerpt: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation."
  },
  {
    id: 2,
    image: "https://via.placeholder.com/400x250/50c878/ffffff?text=News+Image+2",
    headline: "Ut enim ad minim veniam, quis nostrud exercitation ullamco",
    date: "July 20, 2025",
    excerpt: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
  },
  {
    id: 3,
    image: "https://via.placeholder.com/400x250/ff6b6b/ffffff?text=News+Image+3",
    headline: "Excepteur sint occaecat cupidatat non proident",
    date: "July 18, 2025",
    excerpt: "Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste."
  }
];

const opinionArticles: OpinionArticle[] = [
  {
    id: 1,
    image: "https://via.placeholder.com/400x250/9b59b6/ffffff?text=Opinion+Image+1",
    headline: "From the Community | Lorem ipsum dolor sit amet consectetur adipiscing elit",
    date: "July 23, 2025",
    excerpt: "Opinion excerpt 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    tag: "FROM THE COMMUNITY"
  },
  {
    id: 2,
    image: "https://via.placeholder.com/400x250/e74c3c/ffffff?text=Opinion+Image+2",
    headline: "From the Community | Ut enim ad minim veniam quis nostrud exercitation",
    date: "July 20, 2025",
    excerpt: "Opinion excerpt 2. Duis aute irure dolor in reprehenderit in voluptate.",
    tag: "FROM THE COMMUNITY"
  },
  {
    id: 3,
    image: "https://via.placeholder.com/400x250/f39c12/ffffff?text=Opinion+Image+3",
    headline: "From the Community | Duis aute irure dolor in reprehenderit voluptate",
    date: "July 18, 2025",
    excerpt: "Opinion excerpt 3. Sunt in culpa qui officia deserunt mollit anim id est laborum.",
    tag: "FROM THE COMMUNITY"
  }
];

const sportsArticles: SportsArticle[] = [
  {
    id: 1,
    image: "https://via.placeholder.com/400x250/1abc9c/ffffff?text=Sports+Image+1",
    headline: "Varsity team wins championship",
    date: "July 15, 2025",
    excerpt: "The varsity team clinched the title after a thrilling final match.",
    category: "Basketball"
  },
  {
    id: 2,
    image: "https://via.placeholder.com/400x250/3498db/ffffff?text=Sports+Image+2",
    headline: "Track and field sets new records",
    date: "July 10, 2025",
    excerpt: "Several school records were broken at the annual track meet.",
    category: "Track & Field"
  },
  {
    id: 3,
    image: "https://via.placeholder.com/400x250/e67e22/ffffff?text=Sports+Image+3",
    headline: "Soccer team advances to finals",
    date: "July 5, 2025",
    excerpt: "The soccer team moves on to the finals after a hard-fought victory.",
    category: "Soccer"
  }
];

const featuredArticles: Article[] = [
  {
    id: 1,
    image: "https://via.placeholder.com/600x400/2c3e50/ffffff?text=Featured+1",
    headline: "Featured: Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod",
    date: "July 22, 2025",
    excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  {
    id: 2,
    image: "https://via.placeholder.com/600x400/4a90e2/ffffff?text=Featured+2",
    headline: "Featured: Pellentesque habitant morbi tristique senectus et netus",
    date: "July 21, 2025",
    excerpt: "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget."
  },
  {
    id: 3,
    image: "https://via.placeholder.com/600x400/50c878/ffffff?text=Featured+3",
    headline: "Featured: Etiam sit amet orci eget eros faucibus tincidunt",
    date: "July 20, 2025",
    excerpt: "Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna."
  }
];

const Section: React.FC<{ title: string; articles: Article[] | OpinionArticle[] | SportsArticle[]; type?: 'opinion' | 'sports' | 'news'; }> = ({ title, articles, type }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 pb-2 border-b-2 border-green-600">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <article
          key={article.id}
          className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full"
        >
          <div className="w-full h-48">
            <img
              src={article.image}
              alt={article.headline}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4 md:p-6 flex-1 flex flex-col">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-green-700 transition-colors">
              {article.headline}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-sm text-gray-500">{article.date}</span>
              {type === 'opinion' && (
                <span className="inline-block text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                  {(article as OpinionArticle).tag}
                </span>
              )}
              {type === 'sports' && (
                <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {(article as SportsArticle).category}
                </span>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
);

const FeaturedCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setCurrent((prev) => (prev + 1) % featuredArticles.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCurrentX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      const diff = startX - currentX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swiped left - next slide
          setCurrent((prev) => (prev + 1) % featuredArticles.length);
        } else {
          // Swiped right - previous slide
          setCurrent((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
        }
      }
      setIsDragging(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      setCurrentX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      const diff = startX - currentX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          // Swiped left - next slide
          setCurrent((prev) => (prev + 1) % featuredArticles.length);
        } else {
          // Swiped right - previous slide
          setCurrent((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
        }
      }
      setIsDragging(false);
    }
  };

  const article = featuredArticles[current];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
      <h2 className="text-2xl font-bold text-gray-800 p-6 border-b-2 border-green-600">Featured</h2>
      <div 
        ref={carouselRef}
        className="relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={article.image}
          alt={article.headline}
          className="w-full h-[400px] object-cover transition-all duration-500 select-none"
          draggable={false}
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
            {article.headline}
          </h1>
          <p className="text-sm md:text-base opacity-90 mb-2 line-clamp-3">
            {article.excerpt}
          </p>
          <span className="text-sm opacity-75">{article.date}</span>
        </div>
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {featuredArticles.map((_, idx) => (
            <span
              key={idx}
              className={`w-3 h-3 rounded-full ${idx === current ? 'bg-green-500' : 'bg-white/60'} border border-white transition-all duration-200`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 flex flex-col gap-12 pb-20">
        {/* Featured Carousel */}
        <FeaturedCarousel />
        {/* News Section */}
        <Section title="Latest News" articles={newsArticles} type="news" />
        {/* Opinion Section */}
        <Section title="Opinion" articles={opinionArticles} type="opinion" />
        {/* Sports Section */}
        <Section title="Sports" articles={sportsArticles} type="sports" />
      </div>
    </div>
  );
};

export default HomePage;
