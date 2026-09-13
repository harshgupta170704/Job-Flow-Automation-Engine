"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function DeleteJobDialog({ jobId, jobName }: { jobId: string; jobName: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== jobName) return;
    
    setIsLoading(true);
    try {
      await api.delete(`/api/jobs/${jobId}`);
      toast({
        title: "Job deleted",
        description: `Successfully deleted job ${jobName}`,
      });
      setOpen(false);
      router.push("/jobs");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete job",
        description: err.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Job
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Job</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the job
            <span className="font-semibold text-foreground mx-1">{jobName}</span>
            and all of its execution history.
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-2">
          <label className="text-sm font-medium">
            Please type <span className="font-bold select-all">{jobName}</span> to confirm.
          </label>
          <Input 
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={jobName}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={confirmText !== jobName || isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
