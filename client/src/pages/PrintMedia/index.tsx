import React from "react";
import CategorySection, { type CategoryItem } from "../../components/features/CategorySection";

const mockPrintMedia: CategoryItem[] = [
  {
    id: 1,
    title: "August Magazine Issue Released",
    excerpt: "Featuring campus innovators and community stories.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 28, 2025",
  },
  {
    id: 2,
    title: "Tabloid: Week 34 Highlights",
    excerpt: "Top headlines and snapshots from the week.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 27, 2025",
  },
  {
    id: 3,
    title: "Folios: Special Arts Edition",
    excerpt: "A curated collection of visual and literary pieces.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 26, 2025",
  },
  {
    id: 4,
    title: "Other Issues: Alumni Spotlight",
    excerpt: "Tracing paths of notable graduates.",
    imageUrl: "/vite.svg",
    href: "#",
    date: "Aug 25, 2025",
  },
];

const PrintMediaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CategorySection title="Print Media" items={mockPrintMedia} />
    </div>
  );
};

export default PrintMediaPage;


