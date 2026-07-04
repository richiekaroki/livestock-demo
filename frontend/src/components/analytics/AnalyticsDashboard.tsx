// src/components/analytics/AnalyticsDashboard.tsx
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";
import type { Livestock } from "../../types";
import { healthColors } from "../../utils/constants";

interface AnalyticsDashboardProps {
  data: Livestock[];
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const analytics = useMemo(() => {
    const countyMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const healthMap = new Map<string, number>();

    for (const animal of data) {
      countyMap.set(animal.county, (countyMap.get(animal.county) || 0) + 1);
      typeMap.set(animal.type, (typeMap.get(animal.type) || 0) + 1);
      healthMap.set(animal.health, (healthMap.get(animal.health) || 0) + 1);
    }

    return {
      countyData: Array.from(countyMap, ([county, count]) => ({
        county,
        count,
      })),
      typeData: Array.from(typeMap, ([type, count]) => ({ type, count })),
      healthData: Array.from(healthMap, ([status, count]) => ({
        status,
        count,
      })),
    };
  }, [data]);

  const COLORS = healthColors;

  const TYPE_COLORS = [
    "#B45309", "#7C3AED", "#4F46E5", "#D97706", "#DB2777", "#DC2626",
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                label={(props: PieLabelRenderProps) => `${props.name as string}: ${props.value as number}`}
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
              <XAxis dataKey="county" stroke="var(--color-text-secondary)" fontSize={12} />
              <YAxis stroke="var(--color-text-secondary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-primary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.75rem",
                  fontFamily: "'Fira Sans', sans-serif",
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
                label={(props: PieLabelRenderProps) => `${props.name as string}: ${props.value as number}`}
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

        <div className="card p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
          <svg className="w-12 h-12 text-text-tertiary mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
          </svg>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            Health Trends
          </h3>
          <p className="text-sm text-text-secondary max-w-xs">
            Historical trend data will appear here after 7 days of continuous data collection.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-success font-mono">
            {(
              ((analytics.healthData.find((h) => h.status === "Healthy")
                ?.count || 0) /
                (data.length || 1)) *
              100
            ).toFixed(1)}
            %
          </div>
          <div className="text-sm text-text-secondary mt-1">Healthy Rate</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-text-primary font-mono">
            {analytics.countyData.length}
          </div>
          <div className="text-sm text-text-secondary mt-1">
            Counties Covered
          </div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-text-primary font-mono">
            {analytics.typeData.length}
          </div>
          <div className="text-sm text-text-secondary mt-1">Animal Types</div>
        </div>

        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-info font-mono">
            {data.length}
          </div>
          <div className="text-sm text-text-secondary mt-1">Total Animals</div>
        </div>
      </div>
    </div>
  );
}
