import React from "react";

export type CategoryItem = {
  id: string | number;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  href?: string;
  date?: string;
};

type CategorySectionProps = {
  title: string;
  items: CategoryItem[];
};

const CategorySection: React.FC<CategorySectionProps> = ({ title, items }) => {
  if (!items || items.length === 0) {
    return null;
  }

  const [featured, ...rest] = items;
  const others = rest.slice(0, 3);

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg dark:shadow-gray-900/50 overflow-hidden mb-6 border border-gray-200 dark:border-gray-700 transition-colors">
          {featured.imageUrl && (
            <a href={featured.href || "#"}>
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="w-full h-64 object-cover"
              />
            </a>
          )}
          <div className="p-4">
            <a href={featured.href || "#"} className="block">
              <h3 className="text-xl font-semibold text-green-800 hover:underline">
                {featured.title}
              </h3>
            </a>
            {featured.date && (
              <p className="text-sm text-gray-500 mt-1">{featured.date}</p>
            )}
            {featured.excerpt && (
              <p className="text-gray-700 mt-2">{featured.excerpt}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {others.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-lg dark:shadow-gray-900/30 overflow-hidden flex border border-gray-200 dark:border-gray-700 transition-colors"
            >
              {item.imageUrl && (
                <a href={item.href || "#"} className="w-1/3 hidden sm:block">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </a>
              )}
              <div className="p-4 flex-1">
                <a href={item.href || "#"} className="block">
                  <h4 className="text-lg font-semibold text-gray-800 hover:underline line-clamp-2">
                    {item.title}
                  </h4>
                </a>
                {item.date && (
                  <p className="text-sm text-gray-500 mt-1">{item.date}</p>
                )}
                {item.excerpt && (
                  <p className="text-gray-700 mt-2 line-clamp-3">
                    {item.excerpt}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
