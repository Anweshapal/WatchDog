export interface Log {
  id: number;
  timestamp: string;
  service: string;
  level: string;
  message: string;
}

export interface Alert {
  id: number;
  timestamp: string;
  service: string;
  severity: string;
  message: string;
  anomaly_score: number;
}

export interface Metrics {
  total_logs: number;
  total_errors: number;
  total_warnings: number;
  alerts_triggered: number;
  health_score: number;
  system_status: string;
}

export interface Health {
  health_score: number;
  system_status: string;
  total_logs: number;
  error_count: number;
  error_rate: number;
}

export interface Insights {
  insights: string[];
}
