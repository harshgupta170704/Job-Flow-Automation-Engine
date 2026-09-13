"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { generateIdempotencyKey } from "@/lib/utils";

export function RunJobButton({ jobId, onRunComplete }: { jobId: string; onRunComplete?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const { toast } = useToast();

  const handleRun = async () => {
    if (isLoading || cooldown) return;
    
    setIsLoading(true);
    try {
      const idempotencyKey = generateIdempotencyKey();
      await api.post(`/api/jobs/${jobId}/run`, { idempotencyKey });
      
      toast({
        title: "Job execution started",
        description: "The job has been queued successfully.",
      });
      
      if (onRunComplete) {
        onRunComplete();
      }
      
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to run job",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleRun} 
      disabled={isLoading || cooldown}
      size="sm"
    >
      <Play className="mr-2 h-4 w-4" />
      {isLoading ? "Starting..." : cooldown ? "Queued" : "Run Now"}
    </Button>
  );
}
