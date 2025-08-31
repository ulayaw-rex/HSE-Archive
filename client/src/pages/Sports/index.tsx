import React from "react";
import CategorySection, { type CategoryItem } from "../../components/features/CategorySection";

const mockSports: CategoryItem[] = [
  {
    id: 1,
    title: "Varsity secures championship after thrilling finale",
    excerpt: "A last-minute goal sealed the season for the Hillers.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 28, 2025",
  },
  {
    id: 2,
    title: "Intramurals kick off with record participation",
    excerpt: "Over 30 teams registered across five disciplines.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 27, 2025",
  },
  {
    id: 3,
    title: "Alumni game highlights weekend festivities",
    excerpt: "Former stars return to inspire current athletes.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 26, 2025",
  },
  {
    id: 4,
    title: "Coach unveils development program for rookies",
    excerpt: "Focus on fundamentals and sportsmanship emphasized.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 25, 2025",
  },
];

const SportsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CategorySection title="Sports" items={mockSports} />
    </div>
  );
};

export default SportsPage;


