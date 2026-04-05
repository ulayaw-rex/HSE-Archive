import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MostViewedData } from "./DashboardStats";

const COLORS = ["#14532d", "#166534", "#15803d", "#22c55e", "#86efac"];

interface MostViewedChartProps {
  data: MostViewedData[];
}

export const MostViewedChart: React.FC<MostViewedChartProps> = ({ data }) => {
  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    return `${start.toLocaleDateString(
      "en-US",
      options
    )} - ${end.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full min-h-[300px]">
        <h3 className="text-gray-400 font-medium">
          No views recorded this week
        </h3>
      </div>
    );
  }

  const totalViews = data.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative h-full">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
            <span className="text-2xl">👁</span> Most Viewed This Week
          </h3>
          <p className="text-sm text-gray-500 mt-1">{getDateRange()}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined) => [`${value || 0} Views`, ""]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 group"
            title={item.name}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
              {item.name}
            </span>
            <span className="text-xs font-bold text-gray-500 shrink-0 tabular-nums">
              {item.value} views
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</span>
        <span className="text-sm font-bold text-gray-700 tabular-nums">{totalViews} views</span>
      </div>
    </div>
  );
};