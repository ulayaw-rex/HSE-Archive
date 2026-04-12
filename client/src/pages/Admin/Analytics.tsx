import React, { useState, useEffect, useMemo, useCallback } from "react";
import AxiosInstance from "../../AxiosInstance";
import DatePicker from "../../components/common/DatePicker";
import { usePolling } from "../../hooks/usePolling";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ArticleStat {
  title: string;
  category: string;
  author_name: string;
  views: number;
  created_at: string;
  date_published: string | null;
}

interface StaffStat {
  name: string;
  position: string;
  article_count: number;
  last_active: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

const GREEN_COLORS = [
  "#047857",
  "#059669",
  "#10B981",
  "#34D399",
  "#6EE7B7",
  "#A7F3D0",
];

const DISTINCT_COLORS = [
  "#2563eb",
  "#dc2626",
  "#d97706",
  "#9333ea",
  "#db2777",
  "#0891b2",
  "#ea580c",
  "#4f46e5",
  "#65a30d",
  "#be123c",
];

const CATEGORY_COLOR_MAP: Record<string, string> = {
  News: "#dc2626",
  Features: "#d97706",
  Sports: "#16a34a",
  Literary: "#9333ea",
  University: "#2563eb",
  Entertainment: "#db2777",
  "Sci-Tech": "#4f46e5",
  Opinion: "#ea580c",
  Local: "#0891b2",
  National: "#be123c",
};

const getTrendColor = (category: string, index: number) => {
  if (CATEGORY_COLOR_MAP[category]) return CATEGORY_COLOR_MAP[category];
  const lowerCat =
    category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  if (CATEGORY_COLOR_MAP[lowerCat]) return CATEGORY_COLOR_MAP[lowerCat];
  return DISTINCT_COLORS[index % DISTINCT_COLORS.length];
};

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"articles" | "staff" | "audit">(
    "articles",
  );
  const [articleStats, setArticleStats] = useState<ArticleStat[]>([]);
  const [staffStats, setStaffStats] = useState<StaffStat[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendCategories, setTrendCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("monthly");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const fetchTrendsOnly = async () => {
    try {
      const trendRes = await AxiosInstance.get("/analytics/trends", {
        params: {
          start_date: startDate,
          end_date: endDate,
          granularity: "daily",
        },
      });
      setTrendData(trendRes.data.data);
      setTrendCategories(trendRes.data.categories);
    } catch (error) {
      console.error("Error fetching trends", error);
    }
  };

  const fetchArticleStatsOnly = async (page = 1) => {
    try {
      const res = await AxiosInstance.get(`/analytics/articles?page=${page}`, {
        params: { start_date: startDate, end_date: endDate },
      });
      setArticleStats(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (error) {
      console.error("Error fetching articles", error);
    }
  };

  const fetchStaffStatsOnly = async (page = 1) => {
    try {
      const res = await AxiosInstance.get(`/analytics/staff?page=${page}`, {
        params: { start_date: startDate, end_date: endDate },
      });
      setStaffStats(res.data.data);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (error) {
      console.error("Error fetching staff", error);
    }
  };

  const fetchMainData = useCallback(
    async (silent = false, page = 1) => {
      if (!silent) setLoading(true);
      try {
        if (activeTab === "articles") {
          if (page === 1) await fetchTrendsOnly();
          await fetchArticleStatsOnly(page);
        } else if (activeTab === "staff") {
          await fetchStaffStatsOnly(page);
        }
      } catch (error) {
        console.error("Error fetching main data", error);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [activeTab, startDate, endDate, viewMode],
  );

  useEffect(() => {
    fetchMainData(false, 1);
  }, [fetchMainData]);

  usePolling(() => fetchMainData(true, pagination.current_page), 30000);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchMainData(false, newPage);
    }
  };

  const handleDataUpdate = () => {
    fetchMainData(true, pagination.current_page);
  };

  useEffect(() => {
    window.addEventListener("publicationUpdated", handleDataUpdate);
    window.addEventListener("publicationCreated", handleDataUpdate);
    window.addEventListener("publicationDeleted", handleDataUpdate);
    return () => {
      window.removeEventListener("publicationUpdated", handleDataUpdate);
      window.removeEventListener("publicationCreated", handleDataUpdate);
      window.removeEventListener("publicationDeleted", handleDataUpdate);
    };
  }, [fetchMainData, pagination.current_page]);

  const handleViewModeChange = (mode: "weekly" | "monthly") => {
    setViewMode(mode);
    const today = new Date();
    if (mode === "monthly") {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
      setStartDate(`${year}-${month}-01`);
      setEndDate(`${year}-${month}-${lastDay}`);
    } else {
      const pastDate = new Date(today);
      pastDate.setDate(today.getDate() - 6);
      setStartDate(pastDate.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
    }
  };

  const handleDownload = async (format: "pdf" | "excel") => {
    if (exporting) return;
    setExporting(true);
    try {
      const response = await AxiosInstance.get("/analytics/export", {
        params: {
          start_date: startDate,
          end_date: endDate,
          format,
          type: activeTab,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${activeTab}_report.${format === "excel" ? "csv" : "pdf"}`,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setExporting(false);
    }
  };

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    articleStats.forEach((stat) => {
      let cat = stat.category || "Uncategorized";
      cat = cat.charAt(0).toUpperCase() + cat.slice(1);
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.keys(counts).map((key) => ({
      name: key,
      value: counts[key],
    }));
  }, [articleStats]);

  const viewsData = useMemo(() => {
    const views: Record<string, number> = {};
    articleStats.forEach((stat) => {
      let cat = stat.category || "Uncategorized";
      cat = cat.charAt(0).toUpperCase() + cat.slice(1);
      views[cat] = (views[cat] || 0) + stat.views;
    });
    return Object.keys(views).map((key) => ({ name: key, views: views[key] }));
  }, [articleStats]);

  const AnalyticsSkeleton = ({ showCharts }: { showCharts: boolean }) => (
    <div className="animate-pulse space-y-8">
      {showCharts && (
        <>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
              <div className="h-48 w-48 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center\">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
              <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </>
      )}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"></div>
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-50 dark:bg-gray-800/50 rounded"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Analytics Center
        </h1>
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={() => handleDownload("pdf")}
            disabled={exporting}
            className={`flex-1 lg:flex-none px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors ${
              exporting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            } text-white`}
          >
            {exporting ? "Generating..." : "Export PDF"}
          </button>
          <button
            onClick={() => handleDownload("excel")}
            disabled={exporting}
            className={`flex-1 lg:flex-none px-4 py-2 rounded shadow-sm text-sm font-medium transition-colors ${
              exporting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white`}
          >
            {exporting ? "Generating..." : "Export CSV"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm mb-6 border border-gray-100 dark:border-white/5">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between lg:items-end">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">
            {["articles", "staff"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap flex-1 lg:flex-none ${
                  activeTab === tab
                    ? "bg-white dark:bg-gray-700 text-green-800 dark:text-green-400 shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {tab === "articles"
                  ? "Article Performance"
                  : "Staff Productivity"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2 transition-colors tracking-wide">
                Start Date
              </label>
              <DatePicker
                value={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setViewMode("weekly");
                }}
                placeholder="Select start date"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase mb-2 transition-colors tracking-wide">
                End Date
              </label>
              <DatePicker
                value={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setViewMode("weekly");
                }}
                placeholder="Select end date"
              />
            </div>
          </div>
        </div>
      </div>

      {loading && articleStats.length === 0 && staffStats.length === 0 ? (
        <AnalyticsSkeleton showCharts={activeTab === "articles"} />
      ) : (
        <>
          {activeTab === "articles" && (
            <div className="space-y-6 mb-8 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    Production Trends
                  </h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex text-xs font-medium">
                    <button
                      onClick={() => handleViewModeChange("monthly")}
                      className={`px-3 py-1 rounded transition-all ${
                        viewMode === "monthly"
                          ? "bg-white dark:bg-gray-700 text-green-800 dark:text-green-400 shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => handleViewModeChange("weekly")}
                      className={`px-3 py-1 rounded transition-all ${
                        viewMode === "weekly"
                          ? "bg-white dark:bg-gray-700 text-green-800 dark:text-green-400 shadow-sm"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      }`}
                    >
                      Weekly
                    </button>
                  </div>
                </div>
                <div className="w-full h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={trendData}
                      margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                      <defs>
                        {trendCategories.map((cat, index) => (
                          <linearGradient
                            key={cat}
                            id={`color${cat}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={getTrendColor(cat, index)}
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor={getTrendColor(cat, index)}
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <XAxis
                        dataKey="date"
                        tickFormatter={(str) =>
                          new Date(str).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        minTickGap={30}
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: "#6b7280" }}
                      />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                      />
                      {trendCategories.map((cat, index) => (
                        <Area
                          key={cat}
                          type="monotone"
                          dataKey={cat}
                          stroke={getTrendColor(cat, index)}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill={`url(#color${cat})`}
                          stackId="1"
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {articleStats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                      Content Balance
                    </h3>
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            label
                          >
                            {categoryData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={GREEN_COLORS[index % GREEN_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
                      Reader Interests
                    </h3>
                    <div className="w-full h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={viewsData}
                          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip cursor={{ fill: "#f3f4f6" }} />
                          <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                            {viewsData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={GREEN_COLORS[index % GREEN_COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-white/5 animate-in fade-in duration-300 overflow-hidden">
            <div className="overflow-x-auto">
              {activeTab === "articles" && (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Author(s)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date Published
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-white/5">
                    {articleStats.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                          No articles found in this range.
                        </td>
                      </tr>
                    ) : (
                      articleStats.map((stat, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                            {stat.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs">
                              {stat.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {stat.author_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">
                            {stat.views}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                            {new Date(
                              stat.date_published || stat.created_at,
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
              {activeTab === "staff" && (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Staff Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Articles Published
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Active
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-white/5">
                    {staffStats.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-center py-8 text-gray-500 dark:text-gray-400"
                        >
                          No active staff found.
                        </td>
                      </tr>
                    ) : (
                      staffStats.map((stat, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                            {stat.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {stat.position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <span className="font-bold text-gray-900 dark:text-gray-100 mr-2">
                                {stat.article_count}
                              </span>
                              <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className="h-full bg-blue-600 dark:bg-blue-500"
                                  style={{
                                    width: `${Math.min(stat.article_count * 10, 100)}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-500">
                            {new Date(stat.last_active).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && pagination.last_page > 1 && (
              <div className="flex items-center justify-end border-t border-gray-100 dark:border-white/10 p-4">
                <nav className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page === 1}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-500 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    Previous
                  </button>
                  <div className="text-sm">
                    <span className="font-bold text-green-700 dark:text-green-500">
                      {pagination.current_page}
                    </span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {pagination.last_page}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                    disabled={pagination.current_page === pagination.last_page}
                    className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-green-700 dark:hover:text-green-500 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
