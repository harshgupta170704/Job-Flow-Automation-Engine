"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Job, PaginationMeta } from "@/types";
import { JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      let query = "?pageSize=50";
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (typeFilter !== "ALL") query += `&jobType=${typeFilter}`;
      if (statusFilter !== "ALL") query += `&isActive=${statusFilter === "ACTIVE"}`;
      
      const res = await api.get<Job[]>(`/api/jobs${query}`);
      if (res.data) setJobs(res.data);
      if (res.meta) setMeta(res.meta);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Link>
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="HttpRequest">HTTP Request</SelectItem>
              <SelectItem value="Webhook">Webhook</SelectItem>
              <SelectItem value="DataSync">Data Sync</SelectItem>
              <SelectItem value="Script">Script</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-lg bg-card/50 border-dashed">
          <BriefcaseIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No jobs found</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            {search || typeFilter !== "ALL" || statusFilter !== "ALL" 
              ? "No jobs match your current filters. Try adjusting them." 
              : "You haven't created any jobs yet. Create your first automated job to get started."}
          </p>
          {(search || typeFilter !== "ALL" || statusFilter !== "ALL") ? (
            <Button variant="outline" onClick={() => { setSearch(""); setTypeFilter("ALL"); setStatusFilter("ALL"); }}>
              Clear Filters
            </Button>
          ) : (
            <Button asChild>
              <Link href="/jobs/new">Create your first job</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onRun={fetchJobs} />
          ))}
        </div>
      )}
    </div>
  );
}

function BriefcaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
