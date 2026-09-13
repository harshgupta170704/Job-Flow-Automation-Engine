"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle, AlertCircle, Loader2, Check } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface DeleteJobDialogProps {
  jobId: string;
  jobName: string;
  trigger?: React.ReactNode;
}

export function DeleteJobDialog({ jobId, jobName, trigger }: DeleteJobDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const isConfirmed = confirmText === jobName;

  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading) return;
    setOpen(newOpen);
    if (!newOpen) {
      setConfirmText("");
    }
  };

  const handleDelete = async () => {
    if (!isConfirmed || isLoading) return;

    setIsLoading(true);
    try {
      await api.delete(`/api/jobs/${jobId}`);
      toast({
        title: "Job deleted",
        description: `Successfully deleted job "${jobName}"`,
      });
      setOpen(false);
      setConfirmText("");
      router.push("/jobs");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete job",
        description: err.message || "An unexpected error occurred while deleting the job.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button variant="destructive" className="gap-2 shadow-sm">
            <Trash2 className="h-4 w-4" />
            Delete Job
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-3 sm:gap-4">
          <div className="flex items-start gap-3.5">
            {/* Warning Icon Badge */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900/60">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold text-foreground">
                Delete Job
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-normal">
                This operation is irreversible. Please confirm you wish to delete this job.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Prominent Job Callout Banner */}
        <div className="rounded-lg border border-red-200/80 bg-red-50/60 p-3.5 dark:border-red-900/50 dark:bg-red-950/25 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-800 dark:text-red-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
            <span>Permanent Deletion</span>
          </div>
          <p className="text-xs text-red-900/80 dark:text-red-300/80 leading-relaxed">
            You are about to permanently delete:
          </p>
          <div className="rounded bg-background/80 px-2.5 py-1.5 border border-red-200/60 dark:border-red-900/40 text-foreground font-mono text-xs font-semibold break-all select-all">
            {jobName}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
            All associated execution records, logs, and scheduled tasks will be permanently removed.
          </p>
        </div>

        {/* Confirmation Input Field */}
        <div className="space-y-2">
          <label htmlFor="confirm-job-name" className="text-xs font-medium text-foreground block">
            Type <span className="font-mono font-semibold bg-muted px-1.5 py-0.5 rounded select-all border border-border">{jobName}</span> to confirm:
          </label>
          <div className="relative">
            <Input
              id="confirm-job-name"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={jobName}
              disabled={isLoading}
              className={cn(
                "pr-8 text-sm transition-colors",
                isConfirmed && "border-emerald-500 focus-visible:ring-emerald-500/20"
              )}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter" && isConfirmed && !isLoading) {
                  e.preventDefault();
                  handleDelete();
                }
              }}
            />
            {isConfirmed && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
            className="w-full sm:w-auto gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Deleting Job...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Permanently</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
