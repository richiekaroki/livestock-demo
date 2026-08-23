import { memo, useMemo } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

interface HealthSparklineProps {
  data: { timestamp: string; healthy: number; sick: number; treatment: number }[];
  height?: number;
}

const HealthSparkline = memo(function HealthSparkline({
  data,
  height = 48,
}: HealthSparklineProps) {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        time: new Date(d.timestamp).toLocaleDateString("en-KE", {
          day: "numeric",
          month: "short",
        }),
      })),
    [data]
  );

  if (!data.length) return null;

  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 120, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="healthyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sickGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-error)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-error)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "Fira Sans, system-ui, sans-serif",
              }}
              labelFormatter={(v) => String(v)}
              formatter={(value: number, name: string) => [
                value,
                name === "healthy" ? "Healthy" : name === "sick" ? "Sick" : "Treatment",
              ]}
            />
            <Area
              type="monotone"
              dataKey="healthy"
              stroke="var(--color-success)"
              strokeWidth={2}
              fill="url(#healthyGrad)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="sick"
              stroke="var(--color-error)"
              strokeWidth={2}
              fill="url(#sickGrad)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-0.5 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-text-secondary">Healthy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-error" />
          <span className="text-text-secondary">Sick</span>
        </div>
      </div>
    </div>
  );
});

export default HealthSparkline;
