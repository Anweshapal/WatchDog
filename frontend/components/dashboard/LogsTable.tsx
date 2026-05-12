import { ScrollText } from "lucide-react";

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
import type { Log } from "@/services/types";

interface LogsTableProps {
  logs: Log[];
}

const LEVEL_VARIANTS: Record<string, "danger" | "warning" | "info" | "success"> = {
  error: "danger",
  warning: "warning",
  info: "info",
  debug: "success"
};

export default function LogsTable({ logs }: LogsTableProps) {
  return (
    <Card className="glass-card glass-card-hover fade-up">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="section-title">Live Logs</CardTitle>
          <p className="muted-text">Streaming telemetry feed</p>
        </div>
        <ScrollText className="h-5 w-5 text-cyan-300" />
      </CardHeader>
      <CardContent className="px-0">
        <div className="max-h-[360px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-slate-400">
                    Waiting for logs.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-slate-400">
                      {formatTimestamp(log.timestamp)}
                    </TableCell>
                    <TableCell className="font-medium text-slate-100">
                      {log.service}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={LEVEL_VARIANTS[log.level.toLowerCase()] ?? "info"}
                      >
                        {log.level}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate text-slate-300">
                      {log.message}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
