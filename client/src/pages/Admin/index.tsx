import React, { useEffect, useMemo, useState } from "react";
import CategorySection, { type CategoryItem } from "../../components/features/CategorySection";
import DashboardStatsCards from "../../components/features/DashboardStats";
import { fetchNews, createNews, updateNews, deleteNews, fetchDashboardStats, type NewsDTO, mapNewsToCategoryItem } from "../../utils/api";
import type { DashboardStats as DashboardStatsType } from "../../utils/api";

const emptyForm: Omit<NewsDTO, "id"> = {
  title: "",
  excerpt: "",
  image_url: "/vite.svg",
  href: "#",
  date: new Date().toDateString(),
  content: "",
};

const AdminPage: React.FC = () => {
  const [items, setItems] = useState<NewsDTO[]>([]);
  const [form, setForm] = useState<Omit<NewsDTO, "id">>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [newsData, statsData] = await Promise.all([
          fetchNews(),
          fetchDashboardStats()
        ]);
        setItems(newsData);
        setDashboardStats(statsData);
      } catch (err) {
        setError("Failed to fetch dashboard stats.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryItems: CategoryItem[] = useMemo(() => items.map(mapNewsToCategoryItem), [items]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    (async () => {
      if (editingId === null) {
        await createNews(form);
      } else {
        await updateNews(editingId, form);
        setEditingId(null);
      }
      setForm(emptyForm);
      const [newsData, statsData] = await Promise.all([
        fetchNews(),
        fetchDashboardStats()
      ]);
      setItems(newsData);
      setDashboardStats(statsData);
    })();
  }

  function handleEdit(item: NewsDTO) {
    setEditingId(Number(item.id));
    const { id, ...rest } = item;
    setForm(rest);
  }

  function handleDelete(id: number) {
    (async () => {
      await deleteNews(id);
      const [newsData, statsData] = await Promise.all([
        fetchNews(),
        fetchDashboardStats()
      ]);
      setItems(newsData);
      setDashboardStats(statsData);
    })();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-2 px-2 md:py-4 md:px-0">
        <h1 className="text-xl md:text-2xl font-semibold mb-4">Admin Dashboard</h1>

        {/* Dashboard Stats Cards */}
        {loading ? (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">Loading dashboard stats...</p>
          </div>
        ) : error ? (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        ) : dashboardStats ? (
          <DashboardStatsCards stats={dashboardStats} />
        ) : (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">No dashboard stats available.</p>
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">Manage News</h2>

        <form onSubmit={handleSubmit} className="grid gap-3 max-w-2xl mb-8 bg-white border rounded-md p-4">
          <input
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            placeholder="Excerpt"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            placeholder="Link URL"
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            placeholder="Date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <textarea
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            placeholder="Content (optional)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={4}
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
              {editingId === null ? "Create" : "Update"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                className="border px-4 py-2 rounded hover:bg-green-50"
                onClick={() => { setEditingId(null); setForm(emptyForm); }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Items</h2>
        </div>

        <div className="mb-6 bg-white border rounded-md p-4">
          <CategorySection title="Preview" items={categoryItems} />
        </div>

        <ul className="grid gap-3">
          {items.map((item) => (
            <li key={item.id} className="border rounded-md p-3 bg-white flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-sm text-gray-600">{item.excerpt}</div>
                <div className="text-xs text-gray-500">{item.date}</div>
                {item.views !== undefined && (
                  <div className="text-xs text-blue-600">Views: {item.views}</div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded hover:bg-green-50 text-green-700" onClick={() => handleEdit(item)}>Edit</button>
                <button className="px-3 py-1 border rounded text-red-600 hover:bg-red-50" onClick={() => handleDelete(Number(item.id))}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPage;


