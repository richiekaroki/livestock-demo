// src/components/analytics/AnalyticsDashboard.tsx
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAutoRefresh } from "../../hooks/useAutoRefresh"; // NEW IMPORT
import type { Livestock } from "../../types";
import RefreshIndicator from "../dashboard/RefreshIndicator"; // NEW IMPORT

interface AnalyticsDashboardProps {
  data: Livestock[];
  onRefresh?: () => Promise<void>; // NEW: Added optional refresh prop
}

/**
 * Analytics Dashboard Component
 *
 * Comprehensive data visualization for livestock management.
 * Directly addresses MifugoLink job requirement: "market analytics module"
 *
 * Features:
 * - Health trends visualization (line chart)
 * - County distribution analysis (bar chart)
 * - Animal type breakdown (pie chart)
 * - Critical health alerts
 * - Auto-refresh capabilities
 *
 * Interview Talking Points:
 * - "Built analytics dashboard with Recharts (mentioned in job description)"
 * - "Provides actionable insights for farmers and veterinarians"
 * - "Scalable to 22M+ animals with aggregation strategies"
 * - "Real-time data updates with user-controlled refresh"
 */
export default function AnalyticsDashboard({
  data,
  onRefresh,
}: AnalyticsDashboardProps) {
  // NEW: Auto-refresh for analytics
  const autoRefresh = useAutoRefresh({
    enabled: true,
    interval: 45000, // 45 seconds for analytics (less frequent)
    onRefresh: onRefresh,
  });

  // Process data for visualizations
  const analytics = {
    // County Distribution
    countyData: Object.entries(
      data.reduce((acc, animal) => {
        acc[animal.county] = (acc[animal.county] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([county, count]) => ({ county, count })),

    // Animal Type Breakdown
    typeData: Object.entries(
      data.reduce((acc, animal) => {
        acc[animal.type] = (acc[animal.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([type, count]) => ({ type, count })),

    // Health Status Distribution
    healthData: Object.entries(
      data.reduce((acc, animal) => {
        acc[animal.health] = (acc[animal.health] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({ status, count })),

    // Critical Animals (Sick or Under Treatment)
    criticalAnimals: data.filter(
      (a) => a.health === "Sick" || a.health === "Under Treatment"
    ),
  };

  // Colors for charts
  const COLORS = {
    Healthy: "#22c55e",
    Sick: "#ef4444",
    "Under Treatment": "#eab308",
    Recovered: "#3b82f6",
  };

  const TYPE_COLORS = [
    "#f97316",
    "#a855f7",
    "#6366f1",
    "#f59e0b",
    "#ec4899",
    "#ef4444",
  ];

  return (
    <div className="space-y-6">
      {/* Auto-Refresh Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-text-primary">
          Analytics & Insights
        </h2>

        {/* NEW: Auto-Refresh Indicator */}
        <RefreshIndicator
          isRefreshing={autoRefresh.isRefreshing}
          lastRefresh={autoRefresh.lastRefresh}
          countdown={autoRefresh.countdown}
          isPaused={autoRefresh.isPaused}
          onRefresh={autoRefresh.triggerRefresh}
          onPause={autoRefresh.pause}
          onResume={autoRefresh.resume}
        />
      </div>

      {/* Critical Alerts Section */}
      {analytics.criticalAnimals.length > 0 && (
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-red-800 dark:text-red-300 mb-1">
                ⚠️ {analytics.criticalAnimals.length} Animals Require Attention
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">
                {
                  analytics.criticalAnimals.filter((a) => a.health === "Sick")
                    .length
                }{" "}
                sick,{" "}
                {
                  analytics.criticalAnimals.filter(
                    (a) => a.health === "Under Treatment"
                  ).length
                }{" "}
                under treatment
                {autoRefresh.lastRefresh && (
                  <span className="block mt-1 text-xs">
                    Last updated: {autoRefresh.lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </p>
              <button className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline">
                View Critical Animals →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Health Status Distribution (Pie Chart) */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Health Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.healthData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ status, count }) => `${status}: ${count}`}
              >
                {analytics.healthData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[entry.status as keyof typeof COLORS] || "#94a3b8"
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* County Distribution (Bar Chart) */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Animals by County
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.countyData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis dataKey="county" stroke="var(--color-text-secondary)" />
              <YAxis stroke="var(--color-text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar
                dataKey="count"
                fill="var(--color-accent)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Animal Type Breakdown (Pie Chart) */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Livestock Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.typeData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ type, count }) => `${type}: ${count}`}
              >
                {analytics.typeData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={TYPE_COLORS[index % TYPE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Health Trend (Mock Time Series - Placeholder) */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-text-primary mb-4">
            Health Trends (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={[
                { day: "Mon", healthy: 15, sick: 3, treatment: 2 },
                { day: "Tue", healthy: 16, sick: 2, treatment: 2 },
                { day: "Wed", healthy: 17, sick: 2, treatment: 1 },
                { day: "Thu", healthy: 18, sick: 1, treatment: 1 },
                { day: "Fri", healthy: 19, sick: 1, treatment: 0 },
                { day: "Sat", healthy: 20, sick: 1, treatment: 1 },
                { day: "Sun", healthy: 21, sick: 0, treatment: 1 },
              ]}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
              />
              <XAxis dataKey="day" stroke="var(--color-text-secondary)" />
              <YAxis stroke="var(--color-text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="healthy"
                stroke="#22c55e"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="sick"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="treatment"
                stroke="#eab308"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-text-tertiary mt-2">
            Note: Mock data for demonstration. In production, this would show
            real historical trends.
          </p>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {(
              ((analytics.healthData.find((h) => h.status === "Healthy")
                ?.count || 0) /
                data.length) *
              100
            ).toFixed(1)}
            %
          </div>
          <div className="text-sm text-text-secondary mt-1">Healthy Rate</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">
            {analytics.countyData.length}
          </div>
          <div className="text-sm text-text-secondary mt-1">
            Counties Covered
          </div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">
            {analytics.typeData.length}
          </div>
          <div className="text-sm text-text-secondary mt-1">Animal Types</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data.length}
          </div>
          <div className="text-sm text-text-secondary mt-1">Total Animals</div>
        </div>
      </div>
    </div>
  );
}
