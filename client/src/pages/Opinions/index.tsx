import React from "react";
import CategorySection, { type CategoryItem } from "../../components/features/CategorySection";

const mockOpinions: CategoryItem[] = [
  {
    id: 1,
    title: "Why campus sustainability needs student leadership",
    excerpt: "A call to action for greener initiatives led by the student body.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 28, 2025",
  },
  {
    id: 2,
    title: "Rethinking study culture during finals week",
    excerpt: "Rest and balance are as important as grind.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 27, 2025",
  },
  {
    id: 3,
    title: "The case for open educational resources",
    excerpt: "Lowering barriers without compromising quality.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 26, 2025",
  },
  {
    id: 4,
    title: "A letter to first-year students",
    excerpt: "Advice on navigating academics and community.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 25, 2025",
  },
];

const OpinionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CategorySection title="Opinions" items={mockOpinions} />
    </div>
  );
};

export default OpinionsPage;


