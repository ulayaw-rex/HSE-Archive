import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { WeeklyData, CategoryData } from "./DashboardStats";
import { useTheme } from "../../../context/ThemeContext";

interface DashboardChartsProps {
  weeklyData: WeeklyData[];
  categoryData: CategoryData[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  weeklyData,
  categoryData,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const textColor = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.1)" : "#e5e7eb";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors duration-200">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
          Weekly Engagement
        </h3>
        <div className="h-[300px] w-full font-sans text-sm">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={weeklyData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: textColor }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: textColor }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderRadius: "8px",
                  border: `1px solid ${tooltipBorder}`,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  color: isDark ? "#f9fafb" : "#111827",
                }}
                itemStyle={{ color: isDark ? "#10b981" : "#059669" }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#16a34a"
                fillOpacity={1}
                fill="url(#colorViews)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 transition-colors duration-200">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
          Content Distribution
        </h3>
        <div className="h-[300px] w-full font-sans text-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={gridColor}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: textColor }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: textColor }}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.05)" : "#f0fdf4" }}
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderRadius: "8px",
                  border: `1px solid ${tooltipBorder}`,
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  color: isDark ? "#f9fafb" : "#111827",
                }}
              />
              <Bar
                dataKey="articles"
                fill="#16a34a"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
