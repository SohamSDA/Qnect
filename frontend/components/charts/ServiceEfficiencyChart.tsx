"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { fetchTokenStatusAnalytics, TokenStatusCount } from "@/lib/api/admin";
import ChartWrapper from "./ChartWrapper";

const COLORS = ["#facc15", "#22c55e", "#ef4444", "#6b7280"];
const PLACEHOLDER_COLORS = ["#cbd5e1", "#94a3b8", "#cbd5e1", "#94a3b8"];
const placeholderData: TokenStatusCount[] = [
  { status: "Waiting", count: 3 },
  { status: "Served", count: 5 },
  { status: "Skipped", count: 1 },
  { status: "Cancelled", count: 1 },
];

export default function ServiceEfficiencyChart() {
  const [data, setData] = useState<TokenStatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await fetchTokenStatusAnalytics();
        setData(analyticsData);
      } catch (err) {
        console.error("Failed to load token status analytics:", err);
        setError("Failed to load token status data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ChartWrapper
        title="Service Efficiency"
        description="Distribution of token statuses across the system."
      >
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </ChartWrapper>
    );
  }

  if (error) {
    return (
      <ChartWrapper
        title="Service Efficiency"
        description="Distribution of token statuses across the system."
      >
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-red-500">{error}</p>
        </div>
      </ChartWrapper>
    );
  }

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const hasData = totalCount > 0;
  const pieData = (hasData ? data : placeholderData).map((item) => ({
    status: item.status,
    count: item.count,
  }));

  return (
    <ChartWrapper
      title="Service Efficiency"
      description={
        hasData
          ? "Distribution of token statuses across the system."
          : "No live data yet. Showing sample status distribution for layout preview."
      }
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="count"
            nameKey="status"
            outerRadius={95}
            innerRadius={50}
            paddingAngle={3}
            label={({ name, percent }) =>
              `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`
            }
          >
            {pieData.map((_, i) => (
              <Cell
                key={i}
                fill={
                  hasData
                    ? COLORS[i % COLORS.length]
                    : PLACEHOLDER_COLORS[i % PLACEHOLDER_COLORS.length]
                }
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
