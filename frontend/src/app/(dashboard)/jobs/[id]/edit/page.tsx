"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Job } from "@/types";
import { AlertCircle } from "lucide-react";

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [conflictError, setConflictError] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("HttpRequest");
  const [scheduleCron, setScheduleCron] = useState("");
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryDelay, setRetryDelay] = useState(300);
  const [timeoutSecs, setTimeoutSecs] = useState(60);

  // Config State
  const [httpUrl, setHttpUrl] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [httpHeaders, setHttpHeaders] = useState('{"Content-Type": "application/json"}');
  const [httpBody, setHttpBody] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get<Job>(`/api/jobs/${params.id}`);
        if (res.data) {
          const job = res.data;
          setName(job.name);
          setDescription(job.description || "");
          setJobType(job.jobType);
          setScheduleCron(job.scheduleCron || "");
          setMaxRetries(job.maxRetries);
          setRetryDelay(job.retryDelaySeconds);
          setTimeoutSecs(job.timeoutSeconds);

          if (job.jobType === "HttpRequest") {
            const config = JSON.parse(job.configuration);
            setHttpUrl(config.url || "");
            setHttpMethod(config.method || "GET");
            setHttpHeaders(config.headers ? JSON.stringify(config.headers, null, 2) : "{}");
            setHttpBody(config.body || "");
          }
        }
      } catch (err: any) {
        toast({ variant: "destructive", title: "Failed to load job", description: err.message });
      } finally {
        setIsFetching(false);
      }
    };
    fetchJob();
  }, [params.id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setConflictError("");

    let parsedHeaders = {};
    try {
      if (httpHeaders) parsedHeaders = JSON.parse(httpHeaders);
    } catch (e) {
      toast({ variant: "destructive", title: "Invalid JSON in Headers" });
      setIsLoading(false);
      return;
    }

    let configuration = {};
    if (jobType === "HttpRequest") {
      configuration = {
        url: httpUrl,
        method: httpMethod,
        headers: parsedHeaders,
        body: httpBody || undefined,
      };
    }

    const payload = {
      name,
      description: description || null,
      configuration: JSON.stringify(configuration),
      scheduleCron: scheduleCron || null,
      maxRetries: Number(maxRetries),
      retryDelaySeconds: Number(retryDelay),
      timeoutSeconds: Number(timeoutSecs),
    };

    try {
      await api.put(`/api/jobs/${params.id}`, payload);
      toast({ title: "Job updated successfully!" });
      router.push(`/jobs/${params.id}`);
    } catch (err: any) {
      if (err.message?.includes("409")) {
        setConflictError("This job was modified by someone else since you opened it. Please refresh to see the latest changes.");
      } else {
        toast({ variant: "destructive", title: "Failed to update job", description: err.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div>Loading job details...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isLoading || !!conflictError}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {conflictError && (
        <div className="rounded-md bg-destructive/15 p-4 flex gap-3 text-destructive border border-destructive/20">
          <AlertCircle className="h-5 w-5" />
          <p>{conflictError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Job Name *</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={jobType} disabled>
                  <SelectTrigger className="bg-muted"><SelectValue /></SelectTrigger>
                </Select>
                <p className="text-xs text-muted-foreground">Job type cannot be changed after creation.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule & Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="schedule">Cron Schedule (UTC)</Label>
                <Input id="schedule" value={scheduleCron} onChange={e => setScheduleCron(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="retries">Max Retries</Label>
                  <Input id="retries" type="number" min="0" max="10" value={maxRetries} onChange={e => setMaxRetries(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay">Retry Delay (s)</Label>
                  <Input id="delay" type="number" min="0" value={retryDelay} onChange={e => setRetryDelay(Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeout">Timeout (s)</Label>
                  <Input id="timeout" type="number" min="1" value={timeoutSecs} onChange={e => setTimeoutSecs(Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobType === "HttpRequest" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL *</Label>
                    <Input id="url" type="url" required value={httpUrl} onChange={e => setHttpUrl(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>HTTP Method</Label>
                    <Select value={httpMethod} onValueChange={setHttpMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headers">Headers (JSON)</Label>
                    <Textarea id="headers" className="font-mono text-sm" value={httpHeaders} onChange={e => setHttpHeaders(e.target.value)} />
                  </div>
                  {["POST", "PUT", "PATCH"].includes(httpMethod) && (
                    <div className="space-y-2">
                      <Label htmlFor="body">Request Body</Label>
                      <Textarea id="body" className="font-mono text-sm min-h-[150px]" value={httpBody} onChange={e => setHttpBody(e.target.value)} />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
