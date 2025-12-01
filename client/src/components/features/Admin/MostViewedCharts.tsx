import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { MostViewedData } from "./DashboardStats";

const COLORS = ["#14532d", "#166534", "#15803d", "#22c55e", "#dcfce7"];

// 1. Define Props
interface MostViewedChartProps {
  data: MostViewedData[];
}

// 2. Accept Props
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

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as any}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
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
              formatter={(value: number) => [`${value} Views`, ""]}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", maxWidth: "40%" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
