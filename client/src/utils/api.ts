import { type CategoryItem } from "../components/features/CategorySection";

export type NewsDTO = {
  id: number;
  title: string;
  excerpt?: string;
  image_url?: string;
  href?: string;
  date?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  views?: number;
};

export type DashboardStats = {
  totalArticles: number;
  mostPopularArticle: {
    id: number;
    title: string;
    excerpt?: string;
    views: number;
    date?: string;
  } | null;
};

export function mapNewsToCategoryItem(n: NewsDTO): CategoryItem {
  return {
    id: n.id,
    title: n.title,
    excerpt: n.excerpt ?? "",
    imageUrl: n.image_url ?? "/vite.svg",
    href: n.href ?? "#",
    date: n.date ?? "",
  };
}

const BASE = "/api";

export async function fetchNews(): Promise<NewsDTO[]> {
  const res = await fetch(`${BASE}/news`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export async function createNews(input: Omit<NewsDTO, "id">): Promise<NewsDTO> {
  const res = await fetch(`${BASE}/news`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create news");
  return res.json();
}

export async function updateNews(id: number, input: Partial<NewsDTO>): Promise<NewsDTO> {
  const res = await fetch(`${BASE}/news/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update news");
  return res.json();
}

export async function deleteNews(id: number): Promise<void> {
  const res = await fetch(`${BASE}/news/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete news");
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${BASE}/dashboard/stats`);
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
}

export async function incrementViews(id: number): Promise<{ views: number }> {
  const res = await fetch(`${BASE}/news/${id}/increment-views`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to increment views");
  return res.json();
}


