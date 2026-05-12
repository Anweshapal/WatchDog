import { BellRing, Database, ShieldCheck, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Health, Metrics } from "@/services/types";

interface MetricsOverviewProps {
  metrics: Metrics | null;
  health: Health | null;
}

const formatter = new Intl.NumberFormat("en-US");

export default function MetricsOverview({ metrics, health }: MetricsOverviewProps) {
  const items = [
    {
      label: "Total Logs",
      value: metrics?.total_logs,
      icon: Database,
      tone: "text-cyan-300"
    },
    {
      label: "Total Errors",
      value: metrics?.total_errors,
      icon: TriangleAlert,
      tone: "text-rose-300"
    },
    {
      label: "Health Score",
      value: health?.health_score ?? metrics?.health_score,
      icon: ShieldCheck,
      tone: "text-emerald-300"
    },
    {
      label: "Alerts Triggered",
      value: metrics?.alerts_triggered,
      icon: BellRing,
      tone: "text-amber-300"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="glass-card glass-card-hover fade-up">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold text-slate-300">
                {item.label}
              </CardTitle>
              <Icon className={`h-5 w-5 ${item.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-slate-100">
                {typeof item.value === "number"
                  ? formatter.format(item.value)
                  : "--"}
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-500">
                Live
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
