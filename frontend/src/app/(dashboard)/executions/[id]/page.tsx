"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ExecutionDetail } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDuration } from "@/lib/utils";
import { ArrowLeft, RefreshCw, XCircle, AlertTriangle, FileJson, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { format } from "date-fns";

export default function ExecutionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [execution, setExecution] = useState<ExecutionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExecution = async () => {
    try {
      const res = await api.get<ExecutionDetail>(`/api/executions/${params.id}`);
      if (res.data) setExecution(res.data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
      if (err.message?.includes("404")) router.back();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExecution();
    
    // Auto-refresh if running or pending
    let interval: NodeJS.Timeout;
    if (execution && (execution.status === "Running" || execution.status === "Pending")) {
      interval = setInterval(fetchExecution, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [params.id, execution?.status]);

  const handleAction = async (action: 'retry' | 'cancel') => {
    if (!execution) return;
    setActionLoading(true);
    try {
      await api.post(`/api/executions/${execution.id}/${action}`);
      toast({ title: `Successfully ${action === 'retry' ? 'retried' : 'cancelled'} execution` });
      if (action === 'retry') {
        router.push(`/jobs/${execution.jobId}`);
      } else {
        fetchExecution();
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action failed", description: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || !execution) {
    return <div className="flex justify-center py-12 text-muted-foreground">Loading execution details...</div>;
  }

  const isTerminal = ["Succeeded", "Failed", "TimedOut", "Cancelled"].includes(execution.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <Link href={`/jobs/${execution.jobId}`} className="hover:text-foreground flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Job
        </Link>
        <span>/</span>
        <span className="font-mono">Execution #{execution.id.substring(0, 8)}...</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <StatusBadge status={execution.status} />
          <div>
            <h1 className="text-xl font-bold">Attempt {execution.attemptNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Created at {format(new Date(execution.createdAt), "MMM d, yyyy HH:mm:ss")}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {!isTerminal && (
            <Button variant="destructive" size="sm" onClick={() => handleAction('cancel')} disabled={actionLoading}>
              <XCircle className="mr-2 h-4 w-4" /> Cancel
            </Button>
          )}
          {isTerminal && execution.status !== "Succeeded" && (
            <Button variant="outline" size="sm" onClick={() => handleAction('retry')} disabled={actionLoading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry Now
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><Clock className="mr-2 h-5 w-5 text-muted-foreground" /> Timing details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-y-2 border-b pb-4">
              <span className="text-muted-foreground">Scheduled For</span>
              <span>{format(new Date(execution.scheduledAt), "HH:mm:ss.SSS")}</span>
              
              <span className="text-muted-foreground">Started At</span>
              <span>{execution.startedAt ? format(new Date(execution.startedAt), "HH:mm:ss.SSS") : "—"}</span>
              
              <span className="text-muted-foreground">Completed At</span>
              <span>{execution.completedAt ? format(new Date(execution.completedAt), "HH:mm:ss.SSS") : "—"}</span>
              
              <span className="text-muted-foreground">Duration</span>
              <span className="font-mono">{formatDuration(execution.durationMs)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-y-2 pt-2">
              <span className="text-muted-foreground">Worker ID</span>
              <span className="font-mono truncate" title={execution.workerId || ""}>{execution.workerId || "—"}</span>
              
              <span className="text-muted-foreground">Idempotency Key</span>
              <span className="font-mono truncate text-xs" title={execution.idempotencyKey || ""}>{execution.idempotencyKey || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center"><FileJson className="mr-2 h-5 w-5 text-muted-foreground" /> Result</CardTitle>
          </CardHeader>
          <CardContent>
            {execution.resultStatusCode ? (
              <div className="space-y-2">
                <div className="flex gap-2 items-center text-sm mb-2">
                  <span className="text-muted-foreground">Status Code:</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${execution.resultStatusCode < 400 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {execution.resultStatusCode}
                  </span>
                </div>
                {execution.resultBody && (
                  <div className="bg-muted p-3 rounded-md overflow-auto max-h-[160px] text-xs font-mono border">
                    {execution.resultBody}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm italic flex items-center justify-center h-[100px]">
                No result data available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {execution.errorMessage && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-destructive flex items-center text-lg">
              <AlertTriangle className="mr-2 h-5 w-5" /> Error Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-semibold text-sm mb-2">{execution.errorMessage}</div>
            {execution.errorDetails && (
              <pre className="bg-background/80 p-4 rounded-md text-xs font-mono overflow-auto border border-destructive/20 text-muted-foreground max-h-[300px]">
                {execution.errorDetails}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription>Detailed worker logs for this specific execution attempt.</CardDescription>
        </CardHeader>
        <CardContent>
          {execution.logs && execution.logs.length > 0 ? (
            <div className="space-y-1">
              {execution.logs.map((log, i) => (
                <div key={i} className="flex gap-3 text-sm border-b last:border-0 py-2 hover:bg-muted/30">
                  <span className="text-muted-foreground font-mono text-xs shrink-0 mt-0.5 w-24">
                    {format(new Date(log.timestamp), "HH:mm:ss.SSS")}
                  </span>
                  <span className={`font-mono text-xs font-bold shrink-0 w-12 ${
                    log.level === 'ERROR' ? 'text-destructive' :
                    log.level === 'WARN' ? 'text-amber-500' :
                    log.level === 'DEBUG' ? 'text-muted-foreground' : 'text-blue-500'
                  }`}>
                    {log.level}
                  </span>
                  <div className="flex-1 min-w-0 font-mono text-xs">
                    <div className="break-words">{log.message}</div>
                    {log.metadata && (
                      <div className="mt-1 text-muted-foreground text-[10px]">
                        {log.metadata}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No logs generated for this execution.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
