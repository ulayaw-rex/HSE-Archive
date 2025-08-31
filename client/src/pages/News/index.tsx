import React, { useEffect, useMemo, useState } from "react";
import CategorySection, { type CategoryItem } from "../../components/features/CategorySection";
import { fetchNews, mapNewsToCategoryItem, type NewsDTO } from "../../utils/api";

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


