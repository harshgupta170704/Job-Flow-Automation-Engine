"use client";

import { Job } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import Link from "next/link";
import { RunJobButton } from "./RunJobButton";

export function JobCard({ job, onRun }: { job: Job; onRun?: () => void }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="truncate pr-2" title={job.name}>{job.name}</CardTitle>
          <Badge variant={job.isActive ? "default" : "secondary"}>
            {job.isActive ? "Active" : "Paused"}
          </Badge>
        </div>
        <CardDescription className="line-clamp-1">{job.description || "No description"}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-3 text-sm">
        <div className="grid grid-cols-2 gap-y-2 gap-x-4">
          <div className="text-muted-foreground">Type</div>
          <div className="font-medium text-right">{job.jobType}</div>
          
          <div className="text-muted-foreground">Schedule</div>
          <div className="font-medium text-right font-mono text-xs">{job.scheduleCron || "Manual"}</div>
          
          <div className="text-muted-foreground">Last Run</div>
          <div className="font-medium text-right">{formatRelativeTime(job.lastRunAt)}</div>
          
          <div className="text-muted-foreground">Status</div>
          <div className="text-right">
            {job.lastExecutionStatus ? (
              <StatusBadge status={job.lastExecutionStatus} />
            ) : (
              "—"
            )}
          </div>
        </div>
        
        {job.totalExecutions > 0 && job.successRate !== null && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Success Rate</span>
              <span>{Math.round(job.successRate)}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${job.successRate > 90 ? 'bg-green-500' : job.successRate > 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${job.successRate}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-3 border-t grid grid-cols-3 gap-2">
        <RunJobButton jobId={job.id} onRunComplete={onRun} />
        <Button variant="outline" size="sm" asChild>
          <Link href={`/jobs/${job.id}/edit`}>
            <Edit className="mr-2 h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href={`/jobs/${job.id}`}>
            <Eye className="mr-2 h-3.5 w-3.5" />
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
