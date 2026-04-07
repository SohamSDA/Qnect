"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchAvgWaitTimeAnalytics, AvgWaitTime } from "@/lib/api/admin";
import ChartWrapper from "./ChartWrapper";

const placeholderData: AvgWaitTime[] = [
  { queue: "Admissions", avgWaitMinutes: 8 },
  { queue: "Library", avgWaitMinutes: 5 },
  { queue: "Accounts", avgWaitMinutes: 11 },
];

export default function WaitTimeChart() {
  const [data, setData] = useState<AvgWaitTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await fetchAvgWaitTimeAnalytics();
        setData(analyticsData);
      } catch (err) {
        console.error("Failed to load wait time analytics:", err);
        setError("Failed to load wait time data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ChartWrapper
        title="Average Waiting Time per Queue"
        description="Shows the average time users wait in different queues."
      >
        <div className="flex items-center justify-center h-[280px]">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </ChartWrapper>
    );
  }

  if (error) {
    return (
      <ChartWrapper
        title="Average Waiting Time per Queue"
        description="Shows the average time users wait in different queues."
      >
        <div className="flex items-center justify-center h-[280px]">
          <p className="text-red-500">{error}</p>
        </div>
      </ChartWrapper>
    );
  }

  const hasData = data.length > 0;
  const chartData = hasData ? data : placeholderData;

  return (
    <ChartWrapper
      title="Average Waiting Time per Queue"
      description={
        hasData
          ? "Shows the average time users wait in different queues."
          : "No live data yet. Showing sample wait-time bars for layout preview."
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
          <XAxis type="number" />
          <YAxis dataKey="queue" type="category" width={110} />
          <Tooltip
            formatter={(value) => (value !== undefined ? `${value} min` : "")}
          />
          <Bar
            dataKey="avgWaitMinutes"
            fill={hasData ? "#16a34a" : "#94a3b8"}
            radius={[0, 6, 6, 0]}
            animationDuration={700}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
