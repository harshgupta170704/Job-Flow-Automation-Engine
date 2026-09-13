"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardStats, Execution } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Briefcase, Server, CheckCircle2, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentExecutions, setRecentExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, execsRes] = await Promise.all([
          api.get<DashboardStats>("/api/dashboard/stats"),
          api.get<Execution[]>("/api/executions?limit=20")
        ]);
        
        if (statsRes.data) setStats(statsRes.data);
        if (execsRes.data) setRecentExecutions(execsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <div className="flex h-full items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {stats?.jobsNeedingAttention ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-center gap-3 text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertCircle className="h-5 w-5" />
          <p>
            <strong>{stats.jobsNeedingAttention} jobs</strong> need attention (consecutive failures).
            <Link href="/jobs?filter=attention" className="ml-2 underline font-medium">View jobs</Link>
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeJobs || 0} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate (24h)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.successRate24h !== undefined ? `${Math.round(stats.successRate24h)}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.successfulExecutions24h || 0} successes / {stats?.failedExecutions24h || 0} failures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalExecutions24h || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all workers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers Online</CardTitle>
            <Server className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.workersOnline || 0}</div>
            <p className="text-xs text-muted-foreground">
              Connected and pulling jobs
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3 font-medium">Job ID</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Duration</th>
                  <th className="p-3 font-medium">Started At</th>
                </tr>
              </thead>
              <tbody>
                {recentExecutions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No recent executions found
                    </td>
                  </tr>
                ) : (
                  recentExecutions.map((exec) => (
                    <tr 
                      key={exec.id} 
                      className="border-t hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/executions/${exec.id}`)}
                    >
                      <td className="p-3 font-mono text-xs">{exec.jobId.substring(0, 8)}...</td>
                      <td className="p-3"><StatusBadge status={exec.status} /></td>
                      <td className="p-3">{formatDuration(exec.durationMs)}</td>
                      <td className="p-3">{formatRelativeTime(exec.startedAt || exec.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
