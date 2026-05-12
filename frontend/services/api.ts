import type { Alert, Health, Insights, Log, Metrics } from "@/services/types";

const DEFAULT_BASE = "http://127.0.0.1:8000";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_BASE).replace(
  /\/$/,
  ""
);
const TIMEOUT_MS = 8000;

async function fetchJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  getLogs: () => fetchJson<Log[]>("/logs"),
  getAlerts: () => fetchJson<Alert[]>("/alerts"),
  getMetrics: () => fetchJson<Metrics>("/metrics"),
  getHealth: () => fetchJson<Health>("/health"),
  getInsights: () => fetchJson<Insights>("/insights")
};
