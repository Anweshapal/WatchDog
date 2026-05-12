import { AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatTimestamp } from "@/lib/format";
import type { Alert } from "@/services/types";

interface AlertsTableProps {
  alerts: Alert[];
}

const SEVERITY_VARIANTS: Record<string, "danger" | "warning" | "info"> = {
  critical: "danger",
  warning: "warning",
  info: "info"
};

export default function AlertsTable({ alerts }: AlertsTableProps) {
  return (
    <Card className="glass-card glass-card-hover fade-up">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="section-title">Alerts</CardTitle>
          <p className="muted-text">Active anomaly signals</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-amber-300" />
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Severity</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-slate-400">
                  No alerts detected yet.
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Badge
                      variant={SEVERITY_VARIANTS[alert.severity.toLowerCase()] ?? "info"}
                    >
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-slate-100">
                    {alert.service}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-slate-300">
                    {alert.message}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {formatTimestamp(alert.timestamp)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
