import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  healthy: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-rose-500"
};

interface TopNavProps {
  status: string | null;
  lastUpdated: Date | null;
}

export default function TopNav({ status, lastUpdated }: TopNavProps) {
  const normalized = status ? status.toLowerCase() : "unknown";
  const indicatorClass = STATUS_STYLES[normalized] ?? "bg-slate-400";

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-glass">
          <Image
            src="/log.png"
            alt="WatchDog logo"
            width={32}
            height={32}
            className="h-8 w-8 brightness-0 invert"
            priority
          />
        </div>
        <div>
          <h1 className="font-display text-4xl font-semibold text-slate-100">
            WatchDog
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[11px] uppercase tracking-[0.25em] text-slate-300">
          <span
            className={cn(
              "h-3 w-3 rounded-full shadow-[0_0_12px_rgba(110,231,255,0.6)]",
              indicatorClass
            )}
          />
          {status ?? "Unknown"}
        </div>
        <div className="text-xs text-slate-400">
          Updated {lastUpdated ? formatTimestamp(lastUpdated) : "--"}
        </div>
      </div>
    </header>
  );
}
