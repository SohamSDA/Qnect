"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchQueueLoadAnalytics, QueueLoad } from "@/lib/api/admin";
import ChartWrapper from "./ChartWrapper";

const placeholderData: QueueLoad[] = [
  { time: "09:00", activeTokens: 1 },
  { time: "10:00", activeTokens: 3 },
  { time: "11:00", activeTokens: 2 },
  { time: "12:00", activeTokens: 4 },
];

export default function QueueLoadChart() {
  const [data, setData] = useState<QueueLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await fetchQueueLoadAnalytics();
        setData(analyticsData);
      } catch (err) {
        console.error("Failed to load queue load analytics:", err);
        setError("Failed to load queue load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ChartWrapper
        title="Queue Load Throughout the Day"
        description="Displays how the number of active tokens changes across different time intervals."
      >
        <div className="flex items-center justify-center h-[260px]">
          <p className="text-gray-500">Loading chart data...</p>
        </div>
      </ChartWrapper>
    );
  }

  if (error) {
    return (
      <ChartWrapper
        title="Queue Load Throughout the Day"
        description="Displays how the number of active tokens changes across different time intervals."
      >
        <div className="flex items-center justify-center h-[260px]">
          <p className="text-red-500">{error}</p>
        </div>
      </ChartWrapper>
    );
  }

  const hasData = data.length > 0;
  const chartData = hasData ? data : placeholderData;

  return (
    <ChartWrapper
      title="Queue Load Throughout the Day"
      description={
        hasData
          ? "Displays how the number of active tokens changes across different time intervals."
          : "No live data yet. Showing a placeholder trend until activity starts."
      }
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} />

          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />

          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            }}
            labelStyle={{ fontWeight: 600 }}
            formatter={(value) => [`${value ?? 0}`, "Active Tokens"]}
          />

          <Line
            type="monotone"
            dataKey="activeTokens"
            stroke={hasData ? "#3b82f6" : "#94a3b8"}
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
            activeDot={{ r: 7 }}
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
