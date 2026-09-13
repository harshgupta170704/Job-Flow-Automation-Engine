"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Job, Execution, PaginationMeta } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDuration, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { RunJobButton } from "@/components/jobs/RunJobButton";
import { DeleteJobDialog } from "@/components/jobs/DeleteJobDialog";
import { Pause, Play, Edit, Clock, History, Settings } from "lucide-react";
import Link from "next/link";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [job, setJob] = useState<Job | null>(null);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [page, setPage] = useState(1);

  const fetchJobDetails = async () => {
    try {
      const [jobRes, execRes] = await Promise.all([
        api.get<Job>(`/api/jobs/${params.id}`),
        api.get<Execution[]>(`/api/executions?jobId=${params.id}&page=${page}&pageSize=10`)
      ]);
      
      if (jobRes.data) setJob(jobRes.data);
      if (execRes.data) setExecutions(execRes.data);
      if (execRes.meta) setMeta(execRes.meta);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error loading job", description: err.message });
      if (err.message?.includes("404")) router.push("/jobs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [params.id, page]);

  const handleToggleActive = async () => {
    if (!job) return;
    setIsToggling(true);
    try {
      await api.put(`/api/jobs/${job.id}/toggle`, { isActive: !job.isActive });
      setJob({ ...job, isActive: !job.isActive });
      toast({ title: `Job ${job.isActive ? 'paused' : 'activated'} successfully` });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to toggle job", description: err.message });
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading || !job) {
    return <div className="flex justify-center py-12 text-muted-foreground">Loading job details...</div>;
  }

  let formattedConfig = "";
  try {
    formattedConfig = JSON.stringify(JSON.parse(job.configuration), null, 2);
  } catch (e) {
    formattedConfig = job.configuration;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{job.name}</h1>
            <Badge variant={job.isActive ? "default" : "secondary"}>
              {job.isActive ? "Active" : "Paused"}
            </Badge>
            <Badge variant="outline">{job.jobType}</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">{job.description || "No description provided."}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <RunJobButton jobId={job.id} onRunComplete={fetchJobDetails} />
          
          <Button variant="outline" size="sm" onClick={handleToggleActive} disabled={isToggling}>
            {job.isActive ? <><Pause className="mr-2 h-4 w-4" /> Pause</> : <><Play className="mr-2 h-4 w-4" /> Activate</>}
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link href={`/jobs/${job.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </Button>
          
          <DeleteJobDialog jobId={job.id} jobName={job.name} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Schedule</span>
              <span className="font-medium flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                {job.scheduleCron || "Manual only"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Next Run</span>
              <span className="font-medium">{job.isActive ? formatRelativeTime(job.nextRunAt) : "—"}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Total Executions</span>
              <span className="font-medium">{job.totalExecutions}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-medium">
                {job.successRate !== null ? `${Math.round(job.successRate)}%` : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history"><History className="mr-2 h-4 w-4" /> Execution History</TabsTrigger>
          <TabsTrigger value="config"><Settings className="mr-2 h-4 w-4" /> Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Attempt</th>
                      <th className="p-3 font-medium">Started At</th>
                      <th className="p-3 font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">No executions found for this job.</td>
                      </tr>
                    ) : (
                      executions.map((exec) => (
                        <tr 
                          key={exec.id} 
                          className="border-t hover:bg-muted/50 cursor-pointer"
                          onClick={() => router.push(`/executions/${exec.id}`)}
                        >
                          <td className="p-3"><StatusBadge status={exec.status} /></td>
                          <td className="p-3">{exec.attemptNumber}</td>
                          <td className="p-3">{formatRelativeTime(exec.startedAt || exec.createdAt)}</td>
                          <td className="p-3">{formatDuration(exec.durationMs)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {meta.totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === meta.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="config" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Payload & Policy</CardTitle>
              <CardDescription>The underlying configuration saved for this job.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium mb-2">Retry Policy</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Max Retries</span>
                      <span>{job.maxRetries}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Retry Delay</span>
                      <span>{job.retryDelaySeconds}s</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Timeout</span>
                      <span>{job.timeoutSeconds}s</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Configuration JSON</h3>
                  <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-auto max-h-[300px]">
                    {formattedConfig}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
