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
import { fetchTokensServedAnalytics, TokensServed } from "@/lib/api/admin";
import ChartWrapper from "./ChartWrapper";

const placeholderData: TokensServed[] = [
  { hour: "09 - 10", served: 2 },
  { hour: "10 - 11", served: 4 },
  { hour: "11 - 12", served: 3 },
  { hour: "12 - 13", served: 5 },
];

export default function TokensServedChart() {
  const [data, setData] = useState<TokensServed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const analyticsData = await fetchTokensServedAnalytics();
        setData(analyticsData);
      } catch (err) {
        console.error("Failed to load tokens served analytics:", err);
        setError("Failed to load tokens served data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <ChartWrapper
        title="Tokens Served Per Hour"
        description="Shows how many tokens were successfully served during each hourly interval."
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
        title="Tokens Served Per Hour"
        description="Shows how many tokens were successfully served during each hourly interval."
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
      title="Tokens Served Per Hour"
      description={
        hasData
          ? "Shows how many tokens were successfully served during each hourly interval."
          : "No live data yet. Showing sample hourly bars for layout preview."
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <XAxis dataKey="hour" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="served"
            fill={hasData ? "#6366f1" : "#94a3b8"}
            radius={[6, 6, 0, 0]}
            animationDuration={700}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
