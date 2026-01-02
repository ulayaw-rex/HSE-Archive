import React, { useState, useEffect, useMemo, useCallback } from "react";
import AxiosInstance from "../../AxiosInstance";
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
}

interface StaffStat {
  name: string;
  position: string;
  article_count: number;
  last_active: string;
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
    "articles"
  );

  const [articleStats, setArticleStats] = useState<ArticleStat[]>([]);
  const [staffStats, setStaffStats] = useState<StaffStat[]>([]);

  const [trendData, setTrendData] = useState<any[]>([]);
  const [trendCategories, setTrendCategories] = useState<string[]>([]);
  const [granularity, setGranularity] = useState<"daily" | "monthly">("daily");

  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 7) + "-01"
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchTrendsOnly = async () => {
    try {
      const trendRes = await AxiosInstance.get("/analytics/trends", {
        params: { start_date: startDate, end_date: endDate, granularity },
      });
      setTrendData(trendRes.data.data);
      setTrendCategories(trendRes.data.categories);
    } catch (error) {
      console.error("Error fetching trends", error);
    }
  };

  const fetchArticleStatsOnly = async () => {
    try {
      const res = await AxiosInstance.get("/analytics/articles", {
        params: { start_date: startDate, end_date: endDate },
      });
      setArticleStats(res.data);
    } catch (error) {
      console.error("Error fetching articles", error);
    }
  };

  const fetchMainData = useCallback(async () => {
    if (!hasLoadedOnce) setLoading(true);

    try {
      if (activeTab === "articles") {
        await Promise.all([fetchTrendsOnly(), fetchArticleStatsOnly()]);
      } else if (activeTab === "staff") {
        const res = await AxiosInstance.get("/analytics/staff", {
          params: { start_date: startDate, end_date: endDate },
        });
        setStaffStats(res.data);
      }
      setHasLoadedOnce(true);
    } catch (error) {
      console.error("Error fetching main data", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, startDate, endDate, granularity, hasLoadedOnce]);

  usePolling(fetchMainData, 30000);

  useEffect(() => {
    setHasLoadedOnce(false);
    fetchMainData();
  }, [startDate, endDate, activeTab, granularity]);

  const handleGranularityChange = (mode: "daily" | "monthly") => {
    setGranularity(mode);

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    if (mode === "monthly") {
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    } else {
      setStartDate(`${year}-${month}-01`);
      const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
      setEndDate(`${year}-${month}-${lastDay}`);
    }
  };

  const handleDownload = async (format: "pdf" | "excel") => {
    try {
      const response = await AxiosInstance.get("/analytics/export", {
        params: {
          start_date: startDate,
          end_date: endDate,
          format: format,
          type: activeTab,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${activeTab}_report.${format === "excel" ? "csv" : "pdf"}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
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

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Analytics Center
        </h1>
        <div className="flex gap-2 w-full lg:w-auto">
          <button
            onClick={() => handleDownload("pdf")}
            className="flex-1 lg:flex-none bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 shadow-sm text-sm font-medium transition-colors"
          >
            Export PDF
          </button>
          <button
            onClick={() => handleDownload("excel")}
            className="flex-1 lg:flex-none bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-sm text-sm font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 justify-between lg:items-end">
          <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
            {["articles", "staff"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap flex-1 lg:flex-none ${
                  activeTab === tab
                    ? "bg-white text-green-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
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
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {activeTab === "articles" && (
        <div className="space-y-6 mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h3 className="text-lg font-bold text-gray-800">
                Production Trends
              </h3>
              <div className="bg-gray-100 p-1 rounded-lg flex text-xs font-medium">
                <button
                  onClick={() => handleGranularityChange("daily")}
                  className={`px-3 py-1 rounded transition-all ${
                    granularity === "daily"
                      ? "bg-green-100 text-green-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => handleGranularityChange("monthly")}
                  className={`px-3 py-1 rounded transition-all ${
                    granularity === "monthly"
                      ? "bg-green-100 text-green-800 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Monthly
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
                    {trendCategories.map((cat, index) => {
                      const color = getTrendColor(cat, index);
                      return (
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
                            stopColor={color}
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor={color}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      if (granularity === "monthly") {
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                        });
                      }
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
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

                  {trendCategories.map((cat, index) => {
                    const color = getTrendColor(cat, index);
                    return (
                      <Area
                        key={cat}
                        type="monotone"
                        dataKey={cat}
                        stroke={color}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#color${cat})`}
                        stackId="1"
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {!loading && articleStats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
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

              <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
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

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          {activeTab === "articles" && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && !hasLoadedOnce ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                ) : articleStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No articles found in this range.
                    </td>
                  </tr>
                ) : (
                  articleStats.map((stat, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {stat.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {stat.category.charAt(0).toUpperCase() +
                            stat.category.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {stat.author_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {stat.views}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(stat.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "staff" && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Articles Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && !hasLoadedOnce ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Loading data...
                    </td>
                  </tr>
                ) : staffStats.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No active staff found in this range.
                    </td>
                  </tr>
                ) : (
                  staffStats.map((stat, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {stat.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {stat.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <span className="font-bold text-gray-900 mr-2">
                            {stat.article_count}
                          </span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-blue-600"
                              style={{
                                width: `${Math.min(
                                  stat.article_count * 10,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(stat.last_active).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
