import React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: string | null;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  if (!status) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none transition-colors",
          "bg-muted/40 text-muted-foreground border-border",
          className
        )}
      >
        {showDot && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />}
        Unknown
      </span>
    );
  }

  const normalized = status.toLowerCase();

  switch (normalized) {
    case "succeeded":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none transition-colors",
            "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />}
          Succeeded
        </span>
      );

    case "failed":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none transition-colors",
            "bg-red-50 text-red-700 border-red-200/80 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60",
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400" />}
          Failed
        </span>
      );

    case "running":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none transition-colors",
            "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60",
            className
          )}
        >
          {showDot && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 dark:bg-blue-400" />
            </span>
          )}
          Running
        </span>
      );

    case "pending":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none transition-colors",
            "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />}
          Pending
        </span>
      );

    case "timedout":
    case "timed out":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none transition-colors",
            "bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/60",
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-orange-500 dark:bg-orange-400" />}
          Timed Out
        </span>
      );

    case "cancelled":
    case "canceled":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none transition-colors",
            "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/60",
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />}
          Cancelled
        </span>
      );

    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border select-none transition-colors",
            "bg-muted/40 text-foreground border-border",
            className
          )}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />}
          {status}
        </span>
      );
  }
}
