import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "info" | "success" | "warning" | "danger";

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-white/10 bg-white/10 text-slate-100",
  info: "border-sky-500/30 bg-sky-500/15 text-sky-100",
  success: "border-emerald-500/30 bg-emerald-500/15 text-emerald-100",
  warning: "border-amber-500/30 bg-amber-500/15 text-amber-100",
  danger: "border-rose-500/30 bg-rose-500/15 text-rose-100"
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
