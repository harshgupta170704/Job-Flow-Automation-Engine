"use client";

import React from "react";
import Link from "next/link";
import { Job } from "@/types";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { formatRelativeTime, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { RunJobButton } from "./RunJobButton";
import {
  Eye,
  Edit,
  Globe,
  Zap,
  RefreshCw,
  Terminal,
  Clock,
  Calendar,
  Activity,
  ArrowUpRight,
  LucideIcon,
} from "lucide-react";

interface JobTypeMeta {
  label: string;
  gradient: string;
  badgeClass: string;
  icon: LucideIcon;
}

const JOB_TYPE_CONFIG: Record<string, JobTypeMeta> = {
  HttpRequest: {
    label: "HTTP Request",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    badgeClass:
      "bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
    icon: Globe,
  },
  Webhook: {
    label: "Webhook",
    gradient: "from-purple-500 via-fuchsia-500 to-pink-500",
    badgeClass:
      "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
    icon: Zap,
  },
  DataSync: {
    label: "Data Sync",
    gradient: "from-teal-500 via-emerald-500 to-green-500",
    badgeClass:
      "bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/60",
    icon: RefreshCw,
  },
  Script: {
    label: "Script",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
    icon: Terminal,
  },
};

export function JobCard({ job, onRun }: { job: Job; onRun?: () => void }) {
  const typeConfig: JobTypeMeta = JOB_TYPE_CONFIG[job.jobType] || {
    label: job.jobType,
    gradient: "from-primary to-primary/80",
    badgeClass: "bg-secondary text-secondary-foreground border-border",
    icon: Terminal,
  };

  const TypeIcon = typeConfig.icon;

  return (
    <Card className="flex flex-col relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 group border-border/80">
      {/* Top accent gradient bar based on job type */}
      <div className={cn("h-1 w-full bg-gradient-to-r", typeConfig.gradient)} />

      <CardHeader className="pb-3 pt-4">
        {/* Type & Active Status Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none transition-colors",
              typeConfig.badgeClass
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {typeConfig.label}
          </span>

          {job.isActive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-muted/60 text-muted-foreground border-border">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              Paused
            </span>
          )}
        </div>

        {/* Job Name */}
        <Link
          href={`/jobs/${job.id}`}
          className="group/title flex items-center justify-between gap-1.5"
          title={job.name}
        >
          <h3 className="font-semibold text-base sm:text-lg tracking-tight text-foreground group-hover/title:text-primary transition-colors line-clamp-1">
            {job.name}
          </h3>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40 -translate-x-0.5 translate-y-0.5 opacity-0 transition-all duration-200 group-hover/title:opacity-100 group-hover/title:translate-x-0 group-hover/title:translate-y-0 group-hover/title:text-primary" />
        </Link>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed min-h-[2rem]">
          {job.description || (
            <span className="italic text-muted-foreground/60">No description provided</span>
          )}
        </p>
      </CardHeader>

      <CardContent className="flex-1 pb-4 text-xs space-y-2.5">
        {/* Metadata grid */}
        <div className="space-y-2 rounded-lg bg-muted/30 p-2.5 border border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
              Schedule
            </span>
            {job.scheduleCron ? (
              <code className="font-mono text-xs bg-muted text-foreground px-1.5 py-0.5 rounded font-medium border border-border/60">
                {job.scheduleCron}
              </code>
            ) : (
              <span className="text-muted-foreground font-medium">Manual</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
              Last Run
            </span>
            <span className="font-medium text-foreground">
              {formatRelativeTime(job.lastRunAt)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-muted-foreground/70" />
              Last Status
            </span>
            <div>
              {job.lastExecutionStatus ? (
                <StatusBadge status={job.lastExecutionStatus} />
              ) : (
                <span className="text-muted-foreground font-mono">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Success Rate */}
        {job.totalExecutions > 0 && job.successRate !== null && (
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Success Rate</span>
              <div className="flex items-center gap-1 font-medium">
                <span
                  className={cn(
                    job.successRate >= 90
                      ? "text-emerald-600 dark:text-emerald-400"
                      : job.successRate >= 70
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {Math.round(job.successRate)}%
                </span>
                <span className="text-muted-foreground/70 font-normal">
                  ({job.totalExecutions} {job.totalExecutions === 1 ? "run" : "runs"})
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  job.successRate >= 90
                    ? "bg-emerald-500"
                    : job.successRate >= 70
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
                style={{ width: `${Math.min(100, Math.max(0, job.successRate))}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 pb-3 border-t bg-muted/15 grid grid-cols-3 gap-2">
        <RunJobButton jobId={job.id} onRunComplete={onRun} />
        <Button variant="outline" size="sm" asChild className="hover:bg-background">
          <Link href={`/jobs/${job.id}/edit`}>
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/jobs/${job.id}`}>
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
