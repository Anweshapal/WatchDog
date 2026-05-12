import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InsightsPanelProps {
  insights: string[];
  className?: string;
}

export default function InsightsPanel({ insights, className }: InsightsPanelProps) {
  const data = insights.length
    ? insights
    : ["No incidents detected from recent telemetry."];

  return (
    <Card className={cn("glass-card glass-card-hover fade-up", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="section-title">AI Insights</CardTitle>
          <p className="muted-text">Narrative signals from the detection engine</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
          <Sparkles className="h-5 w-5 text-violet-300" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {data.map((insight, index) => (
          <div
            key={`${insight}-${index}`}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10"
          >
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
              Insight {index + 1}
            </p>
            <p className="mt-2 text-sm text-slate-200">{insight}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
