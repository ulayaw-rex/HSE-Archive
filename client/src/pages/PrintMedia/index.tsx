import React, { useState, useEffect } from "react";
import CategorySection, {
  type CategoryItem,
} from "../../components/features/Categories/CategorySection";
import AxiosInstance from "../../AxiosInstance";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import type { PrintMedia } from "../../types/PrintMedia";

const PrintMediaPage: React.FC = () => {
  const [printMediaList, setPrintMediaList] = useState<PrintMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrintMedia();
  }, []);

  const fetchPrintMedia = async () => {
    try {
      const response = await AxiosInstance.get("/print-media");
      setPrintMediaList(response.data);
    } catch (error) {
      console.error("Failed to fetch print media:", error);
    } finally {
      setLoading(false);
    }
  };

  const transformToCategoryItem = (item: PrintMedia): CategoryItem => ({
    id: item.print_media_id,
    title: item.title,
    excerpt: item.description,
    imageUrl: item.image_path || "/vite.svg",
    href: item.file_path || "#",
    date: new Date(item.date).toLocaleDateString(),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  const categoryItems: CategoryItem[] = printMediaList.map(
    transformToCategoryItem
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CategorySection title="Print Media" items={categoryItems} />
    </div>
  );
};

export default PrintMediaPage;
