export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Job {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  jobType: 'HttpRequest' | 'Webhook' | 'DataSync' | 'Script';
  configuration: string; // JSON string
  scheduleCron: string | null;
  isActive: boolean;
  maxRetries: number;
  retryDelaySeconds: number;
  timeoutSeconds: number;
  createdAt: string;
  updatedAt: string;
  nextRunAt: string | null;
  lastRunAt: string | null;
  lastExecutionStatus: string | null;
  totalExecutions: number;
  successRate: number | null;
}

export interface Execution {
  id: string;
  jobId: string;
  status: 'Pending' | 'Running' | 'Succeeded' | 'Failed' | 'TimedOut' | 'Cancelled';
  attemptNumber: number;
  workerId: string | null;
  idempotencyKey: string | null;
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  resultStatusCode: number | null;
  resultBody: string | null;
  errorMessage: string | null;
  errorDetails: string | null;
  isRetryable: boolean;
  scheduledAt: string;
  createdAt: string;
}

export interface ExecutionLog {
  id: number;
  timestamp: string;
  level: string;
  message: string;
  metadata: string | null;
}

export interface ExecutionDetail extends Execution {
  logs: ExecutionLog[];
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  jobsNeedingAttention: number;
  totalExecutions24h: number;
  successfulExecutions24h: number;
  failedExecutions24h: number;
  successRate24h: number;
  successRate7d: number;
  workersOnline: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta: PaginationMeta | null;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface HttpJobConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface WebhookJobConfig {
  url: string;
  payload?: string;
  headers?: Record<string, string>;
}
