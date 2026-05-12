import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatShortTime } from "@/lib/format";
import type { Alert, Log } from "@/services/types";

interface ChartsPanelProps {
  logs: Log[];
  alerts: Alert[];
}

const CHART_COLORS = ["#38BDF8", "#FBBF24", "#FB7185", "#A78BFA", "#34D399"];

export default function ChartsPanel({ logs, alerts }: ChartsPanelProps) {
  const errorTrend = buildErrorTrend(logs, 8);
  const healthTrend = buildHealthTrend(logs, 8);
  const serviceData = buildLogsPerService(logs, 6);
  const severityData = buildSeverityDistribution(alerts, logs);

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <ChartCard title="Error Trend" subtitle="Last 20 logs">
        {errorTrend.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={errorTrend}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="errors"
                stroke="#FB7185"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <ChartCard title="Health Trend" subtitle="Derived from recent logs">
        {healthTrend.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={healthTrend}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="health"
                stroke="#34D399"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <ChartCard title="Severity Distribution" subtitle="Alerts and log levels">
        {severityData.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {severityData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color ?? CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <ChartCard title="Logs per Service" subtitle="Top services in the window">
        {serviceData.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={serviceData}>
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#38BDF8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </ChartCard>
    </section>
  );
}

interface ChartCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <Card className="glass-card glass-card-hover fade-up">
      <CardHeader>
        <CardTitle className="section-title">{title}</CardTitle>
        <p className="muted-text">{subtitle}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
      Waiting for data...
    </div>
  );
}

function buildErrorTrend(logs: Log[], buckets: number) {
  return buildBuckets(logs, buckets).map((bucket) => ({
    name: bucket.label,
    errors: bucket.errors
  }));
}

function buildHealthTrend(logs: Log[], buckets: number) {
  return buildBuckets(logs, buckets).map((bucket) => ({
    name: bucket.label,
    health: bucket.health
  }));
}

function buildLogsPerService(logs: Log[], limit: number) {
  const counts = new Map<string, number>();
  logs.forEach((log) => {
    counts.set(log.service, (counts.get(log.service) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function buildSeverityDistribution(alerts: Alert[], logs: Log[]) {
  const counts = new Map<string, number>();
  if (alerts.length) {
    alerts.forEach((alert) => {
      const key = alert.severity.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  } else {
    logs.forEach((log) => {
      const key = log.level.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
  }

  const colorMap: Record<string, string> = {
    critical: "#FB7185",
    error: "#FB7185",
    warning: "#FBBF24",
    info: "#38BDF8",
    success: "#34D399"
  };

  return Array.from(counts.entries()).map(([name, value]) => ({
    name,
    value,
    color: colorMap[name]
  }));
}

function buildBuckets(logs: Log[], bucketCount: number) {
  if (!logs.length) {
    return [];
  }

  const sorted = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const start = new Date(sorted[0].timestamp).getTime();
  const end = new Date(sorted[sorted.length - 1].timestamp).getTime();
  const span = Math.max(1, end - start);
  const size = Math.max(1, Math.floor(span / bucketCount));

  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    start: start + index * size,
    end: start + (index + 1) * size,
    errors: 0,
    total: 0
  }));

  sorted.forEach((log) => {
    const time = new Date(log.timestamp).getTime();
    const index = Math.min(
      bucketCount - 1,
      Math.floor((time - start) / size)
    );
    const bucket = buckets[index];
    bucket.total += 1;
    if (log.level.toLowerCase() === "error") {
      bucket.errors += 1;
    }
  });

  return buckets.map((bucket) => {
    const errorRate = bucket.total ? bucket.errors / bucket.total : 0;
    const health = Math.max(0, 100 - Math.round(errorRate * 150));
    return {
      label: formatShortTime(bucket.start),
      errors: bucket.errors,
      total: bucket.total,
      health
    };
  });
}

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(148, 163, 184, 0.2)",
  borderRadius: "12px",
  color: "#E2E8F0"
};
