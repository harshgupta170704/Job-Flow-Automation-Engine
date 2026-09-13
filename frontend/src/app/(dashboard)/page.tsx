"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { DashboardStats, Execution } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Briefcase,
  Server,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Clock,
  ExternalLink,
  Layers,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDuration, formatRelativeTime, cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const fetchDashboard = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [statsRes, execsRes] = await Promise.all([
        api.get<DashboardStats>("/api/dashboard/stats"),
        api.get<Execution[]>("/api/dashboard/recent"),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (execsRes.data) setRecentExecutions(execsRes.data);
    } catch (err) {
      console.error("Failed to load dashboard", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(true);
    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 30000); // refresh every 30s

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = user?.name ? user.name.split(" ")[0] : "there";

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Section Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
          <div className="space-y-2">
            <div className="h-8 w-60 bg-muted rounded-md" />
            <div className="h-4 w-80 bg-muted/60 rounded-md" />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-24 bg-muted rounded-md" />
            <div className="h-9 w-32 bg-muted rounded-md" />
          </div>
        </div>

        {/* 4 Stat Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-border/70 bg-card p-5 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="h-9 w-9 rounded-xl bg-muted" />
              </div>
              <div className="h-8 w-20 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted/60 rounded" />
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="rounded-xl border border-border/70 bg-card p-6 space-y-4">
          <div className="space-y-1.5">
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="h-3 w-64 bg-muted/60 rounded" />
          </div>
          <div className="rounded-lg border border-border/60 divide-y divide-border/60 overflow-hidden">
            <div className="h-10 bg-muted/40" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 flex items-center px-4 gap-4">
                <div className="h-4 w-28 bg-muted rounded" />
                <div className="h-6 w-20 bg-muted rounded-full" />
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {displayName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your automated jobs, worker performance, and recent activity.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboard(false)}
            disabled={isRefreshing}
            className="h-9 gap-1.5 text-xs font-medium border-border/70 hover:bg-muted"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-primary")} />
            {isRefreshing ? "Updating..." : "Refresh"}
          </Button>
          <Button asChild size="sm" className="h-9 gap-1.5 text-xs font-medium shadow-sm">
            <Link href="/jobs/new">
              <Plus className="h-4 w-4" />
              Create Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Attention Warning Banner */}
      {stats?.jobsNeedingAttention ? (
        <div className="rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-amber-50/60 to-transparent p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 dark:border-amber-900/60 dark:from-amber-950/40 dark:to-transparent dark:text-amber-200 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-200/80 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {stats.jobsNeedingAttention} {stats.jobsNeedingAttention === 1 ? "job requires" : "jobs require"} attention
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Consecutive failures detected. Inspect worker execution logs to resolve issues.
              </p>
            </div>
          </div>
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-amber-300/90 bg-amber-100/60 hover:bg-amber-100 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-200 text-xs shrink-0 self-start sm:self-auto"
          >
            <Link href="/jobs?filter=attention">
              View affected jobs
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      ) : null}

      {/* Stat Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Jobs */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50/40 via-card to-card dark:from-blue-950/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-blue-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Jobs
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-100/80 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Briefcase className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {stats?.totalJobs ?? 0}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-foreground">{stats?.activeJobs ?? 0}</span> active workflows
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Success Rate (24h) */}
        <Card className="relative overflow-hidden border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/40 via-card to-card dark:from-emerald-950/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Success Rate (24h)
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {stats?.successRate24h !== undefined ? `${Math.round(stats.successRate24h)}%` : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
              <span>{stats?.successfulExecutions24h ?? 0} passed</span>
              <span className="text-muted-foreground/40">·</span>
              <span className={cn(stats?.failedExecutions24h ? "text-destructive font-medium" : "")}>
                {stats?.failedExecutions24h ?? 0} failed
              </span>
            </div>
            {/* Visual mini progress bar */}
            <div className="w-full bg-muted/70 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stats?.successRate24h ?? 0))}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Executions (24h) */}
        <Card className="relative overflow-hidden border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50/40 via-card to-card dark:from-purple-950/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-purple-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Executions (24h)
            </CardTitle>
            <div className="p-2 rounded-xl bg-purple-100/80 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {stats?.totalExecutions24h ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across all background queues
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Workers Online */}
        <Card className="relative overflow-hidden border-l-4 border-l-sky-500 bg-gradient-to-br from-sky-50/40 via-card to-card dark:from-sky-950/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-sky-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workers Online
            </CardTitle>
            <div className="p-2 rounded-xl bg-sky-100/80 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <Server className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-foreground">
              {stats?.workersOnline ?? 0}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  (stats?.workersOnline ?? 0) > 0 ? "bg-sky-500 animate-pulse" : "bg-amber-500"
                )}
              />
              <span className="font-medium text-foreground">
                {(stats?.workersOnline ?? 0) > 0 ? "Connected & pulling tasks" : "No workers online"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Executions Section */}
      <Card className="shadow-sm border-border/70 overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 border-b border-border/60 bg-card/40 pb-4">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              Recent Executions
              {recentExecutions.length > 0 && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {recentExecutions.length}
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Real-time feed of task triggers and completion statuses
            </CardDescription>
          </div>
          {recentExecutions.length > 0 && (
            <Button asChild variant="ghost" size="sm" className="h-8 text-xs font-medium text-primary hover:text-primary gap-1">
              <Link href="/jobs">
                View All Jobs
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {recentExecutions.length === 0 ? (
            /* Illustrated Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="relative mb-5">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-primary/15 to-blue-500/10 flex items-center justify-center text-primary shadow-inner">
                  <Activity className="h-10 w-10 stroke-[1.5]" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-card border-2 border-background flex items-center justify-center text-muted-foreground shadow-sm">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No recent executions found
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-1.5 mb-6">
                Executions will appear here automatically when your scheduled jobs trigger or when you run them manually.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="sm" className="h-9 gap-1.5 shadow-sm">
                  <Link href="/jobs/new">
                    <Plus className="h-4 w-4" />
                    Create Your First Job
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 border-border/70">
                  <Link href="/jobs">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Manage Existing Jobs
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            /* Polished Execution Table */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="px-5 py-3">Job ID</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Duration</th>
                    <th className="px-5 py-3">Started</th>
                    <th className="px-5 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentExecutions.map((exec) => (
                    <tr
                      key={exec.id}
                      onClick={() => router.push(`/executions/${exec.id}`)}
                      className="group hover:bg-muted/50 cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs font-medium text-foreground">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {exec.jobId.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={exec.status} />
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                        {formatDuration(exec.durationMs)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground">
                        {formatRelativeTime(exec.startedAt || exec.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                          <span>View</span>
                          <ChevronRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
