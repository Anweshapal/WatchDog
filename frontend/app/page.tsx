"use client";

import { useCallback, useEffect, useState } from "react";

import AlertsTable from "@/components/dashboard/AlertsTable";
import ChartsPanel from "@/components/dashboard/ChartsPanel";
import HealthPanel from "@/components/dashboard/HealthPanel";
import InsightsPanel from "@/components/dashboard/InsightsPanel";
import LogsTable from "@/components/dashboard/LogsTable";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import TopNav from "@/components/dashboard/TopNav";
import { api } from "@/services/api";
import type { Alert, Health, Insights, Log, Metrics } from "@/services/types";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [metricsData, healthData, alertsData, logsData, insightsData] =
        await Promise.all([
          api.getMetrics(),
          api.getHealth(),
          api.getAlerts(),
          api.getLogs(),
          api.getInsights()
        ]);

      setMetrics(metricsData);
      setHealth(healthData);
      setAlerts(alertsData);
      setLogs(logsData);
      setInsights(insightsData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 6000);

    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 pb-16 pt-10 md:px-10">
      <TopNav status={health?.system_status ?? null} lastUpdated={lastUpdated} />

      {error ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="flex flex-col gap-6">
        <MetricsOverview metrics={metrics} health={health} />

        <div className="grid gap-6 lg:grid-cols-3">
          <HealthPanel health={health} className="lg:col-span-1" />
          <InsightsPanel
            insights={insights?.insights ?? []}
            className="lg:col-span-2"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AlertsTable alerts={alerts} />
          <LogsTable logs={logs} />
        </div>

        <ChartsPanel logs={logs} alerts={alerts} />
      </section>
    </main>
  );
}
