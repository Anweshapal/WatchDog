import { Activity, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Health } from "@/services/types";

interface HealthPanelProps {
  health: Health | null;
  className?: string;
}

const STATUS_VARIANTS: Record<string, "success" | "warning" | "danger" | "info"> = {
  healthy: "success",
  warning: "warning",
  critical: "danger"
};

const BAR_COLORS: Record<string, string> = {
  healthy: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-rose-500"
};

export default function HealthPanel({ health, className }: HealthPanelProps) {
  const score = health?.health_score ?? 0;
  const status = health?.system_status ?? "Unknown";
  const normalized = status.toLowerCase();
  const errorRate =
    health && typeof health.error_rate === "number"
      ? `${(health.error_rate * 100).toFixed(1)}%`
      : "--";

  return (
    <Card className={cn("glass-card glass-card-hover fade-up", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <CardTitle className="section-title">Live Health</CardTitle>
            <p className="muted-text">System readiness and stability</p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANTS[normalized] ?? "info"}>{status}</Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Health score
            </p>
            <p className="mt-2 text-4xl font-semibold text-slate-100">
              {score}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Error rate
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-100">
              {errorRate}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Stability</span>
            <span>{score}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                BAR_COLORS[normalized] ?? "bg-slate-400"
              )}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          <Activity className="h-4 w-4 text-cyan-300" />
          Monitoring {health?.total_logs ?? 0} events in the last window.
        </div>
      </CardContent>
    </Card>
  );
}
