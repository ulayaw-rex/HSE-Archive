import React from "react";
import CategorySection, { type CategoryItem } from "../../components/features/CategorySection";

const mockLiterary: CategoryItem[] = [
  {
    id: 1,
    title: "Beneath the acacia: a short story",
    excerpt: "Memories and monsoon winds intertwine in this reflective piece.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 28, 2025",
  },
  {
    id: 2,
    title: "Poem: Echoes in the hallway",
    excerpt: "A free-verse ode to fleeting semesters.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 27, 2025",
  },
  {
    id: 3,
    title: "Essay: The art of unlearning",
    excerpt: "On growth, humility, and starting anew.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 26, 2025",
  },
  {
    id: 4,
    title: "Poem: Green horizon",
    excerpt: "Finding hope in quiet mornings.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 25, 2025",
  },
];

const LiteraryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CategorySection title="Literary" items={mockLiterary} />
    </div>
  );
};

export default LiteraryPage;


