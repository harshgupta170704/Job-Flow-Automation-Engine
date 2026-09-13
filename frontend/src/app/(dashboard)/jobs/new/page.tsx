"use client";

import { useState } from "react";
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

export default function CreateJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("HttpRequest");
  const [scheduleCron, setScheduleCron] = useState("");
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryDelay, setRetryDelay] = useState(300);
  const [timeout, setTimeoutSecs] = useState(60);

  // Config State
  const [httpUrl, setHttpUrl] = useState("");
  const [httpMethod, setHttpMethod] = useState("GET");
  const [httpHeaders, setHttpHeaders] = useState('{"Content-Type": "application/json"}');
  const [httpBody, setHttpBody] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
    } else {
      toast({ variant: "destructive", title: "Unsupported job type" });
      setIsLoading(false);
      return;
    }

    const payload = {
      name,
      description: description || undefined,
      jobType,
      configuration: JSON.stringify(configuration),
      scheduleCron: scheduleCron || null,
      maxRetries: Number(maxRetries),
      retryDelaySeconds: Number(retryDelay),
      timeoutSeconds: Number(timeout),
    };

    try {
      const res = await api.post<Job>("/api/jobs", payload);
      toast({ title: "Job created successfully!" });
      if (res.data) {
        router.push(`/jobs/${res.data.id}`);
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create job", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Job</h1>
          <p className="text-muted-foreground">Configure a new automated task.</p>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Create Job"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Job Name *</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daily Data Sync" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details about this job" />
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HttpRequest">HTTP Request</SelectItem>
                    <SelectItem value="Webhook">Webhook</SelectItem>
                    <SelectItem value="DataSync" disabled>Data Sync (Coming Soon)</SelectItem>
                    <SelectItem value="Script" disabled>Script (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
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
                <Input id="schedule" value={scheduleCron} onChange={e => setScheduleCron(e.target.value)} placeholder="e.g. 0 * * * * for hourly" />
                <p className="text-xs text-muted-foreground">Leave empty for manual execution only.</p>
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
                  <Input id="timeout" type="number" min="1" value={timeout} onChange={e => setTimeoutSecs(Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Setup the execution payload.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobType === "HttpRequest" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="url">URL *</Label>
                    <Input id="url" type="url" required value={httpUrl} onChange={e => setHttpUrl(e.target.value)} placeholder="https://api.example.com/sync" />
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
                      <Textarea id="body" className="font-mono text-sm min-h-[150px]" value={httpBody} onChange={e => setHttpBody(e.target.value)} placeholder='{"key": "value"}' />
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
