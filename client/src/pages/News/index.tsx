import React, { useEffect, useMemo, useState } from "react";
import CategorySection, { type CategoryItem } from "../../components/features/CategorySection";
import AxiosInstance from "../../AxiosInstance";

// Define the types that were previously in utils/api
export interface NewsDTO {
  id: number;
  title: string;
  excerpt: string;
  image_url: string;
  href: string;
  date: string;
  content: string;
  views?: number;
}

// API functions using AxiosInstance
const fetchNews = async (): Promise<NewsDTO[]> => {
  const response = await AxiosInstance.get('/news');
  return response.data;
};

const mapNewsToCategoryItem = (news: NewsDTO): CategoryItem => ({
  id: news.id,
  title: news.title,
  excerpt: news.excerpt,
  imageUrl: news.image_url,
  href: news.href,
  date: news.date,
});

const NewsPage: React.FC = () => {
  const [items, setItems] = useState<NewsDTO[]>([]);

  useEffect(() => {
    (async () => {
      const data = await fetchNews();
      setItems(data);
    })();
  }, []);

  const categoryItems: CategoryItem[] = useMemo(() => items.map(mapNewsToCategoryItem), [items]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CategorySection title="Latest News" items={categoryItems} />
    </div>
  );
};

export default NewsPage;


