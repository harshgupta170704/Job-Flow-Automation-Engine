# Engineering Notes

## Architecture Overview

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Next.js   │────▶│   .NET 8 API    │────▶│  PostgreSQL  │
│   Frontend  │     │   (REST)        │     │   16         │
└─────────────┘     └────────┬────────┘     └──────┬───────┘
                             │                      │
                    ┌────────▼────────┐             │
                    │  Job Queue      │◀────────────┘
                    │  (DB-backed)    │
                    └────────┬────────┘
                  ┌──────────┼──────────┐
                  ▼          ▼          ▼
            ┌──────────┐┌──────────┐┌──────────┐
            │ Worker 1 ││ Worker 2 ││ Worker 3 │
            └──────────┘└──────────┘└──────────┘
```

The system has four main components:

1. **Frontend** (Next.js 14) — Single-page application with client-side rendering. All API calls go through an authenticated REST client.

2. **API Server** (.NET 8 ASP.NET Core) — Handles CRUD for jobs/executions, authentication, and dashboard aggregation. Does NOT execute jobs directly.

3. **Workers** (.NET 8 BackgroundService) — Long-running processes that poll the job queue, execute jobs, and report results. Can be horizontally scaled.

4. **PostgreSQL** — Single source of truth for job definitions, execution history, and the job queue itself.

## How Jobs Are Picked Up and Executed

### Queue Design

I chose a **database-backed queue** (PostgreSQL) instead of a dedicated message broker (RabbitMQ, Redis). Key reasons:

- **Fewer moving parts**: No extra infrastructure to deploy, monitor, or fail
- **Transactional consistency**: Queue operations and state changes happen in the same database transaction
- **Sufficient throughput**: PostgreSQL's `SKIP LOCKED` handles our expected load (<1000 jobs/sec)

The trade-off is lower throughput vs. a dedicated broker, but for a job automation platform (not a high-frequency trading system), this is the right call.

### Dequeue Flow

```sql
BEGIN;
SELECT * FROM "Executions"
WHERE "Status" = 'Pending'
  AND "ScheduledAt" <= now()
ORDER BY "ScheduledAt"
LIMIT 1
FOR UPDATE SKIP LOCKED;

-- If found, UPDATE status to 'Running', set WorkerId, StartedAt, HeartbeatAt
COMMIT;
```

`FOR UPDATE SKIP LOCKED` is the critical piece — it acquires a row-level lock on the selected execution and **skips rows that are already locked by other workers**. This means:

- Two workers polling simultaneously will get **different** jobs
- No coordination protocol needed beyond the database
- No duplicate execution possible at the dequeue level

### Execution Flow

1. Worker polls every 2 seconds for pending executions
2. Worker acquires an execution via `SKIP LOCKED`
3. Worker starts a heartbeat task (updates `heartbeat_at` every 15 seconds)
4. Worker resolves the appropriate executor (HTTP, Webhook, etc.)
5. Worker executes with a configured timeout via `CancellationTokenSource`
6. On completion, worker updates execution status and records results
7. If failed and retryable (attempt < max), worker enqueues a retry with exponential backoff

Workers process up to 5 jobs concurrently using a `SemaphoreSlim`.

## Concurrency

### Double-Pickup Prevention
`SELECT FOR UPDATE SKIP LOCKED` prevents two workers from picking up the same job. This is database-enforced and cannot be bypassed by application bugs.

### Idempotent "Run Now"
When a user clicks "Run Now", the frontend generates a client-side idempotency key. The API checks if an execution with that key was created in the last 5 minutes — if so, it returns the existing execution instead of creating a new one. This prevents duplicate runs from double-clicks or network retries.

### Optimistic Concurrency for Job Updates
Jobs have a `Version` column. Updates use `WHERE version = @expected`. If two users edit the same job simultaneously, the second update fails with a 409 Conflict.

### Concurrent Workers
Workers are fully independent processes. They share nothing except the database. Scaling is horizontal — start more worker containers. The database handles coordination.

## Retries and Failures

### Retry Strategy
- **Algorithm**: Exponential backoff: `delay = base_delay × 2^(attempt - 1)`, capped at 5 minutes
- **Example** (base = 10s): 10s → 20s → 40s → 80s → 160s → 300s (cap)
- **Each retry is a new execution record** — preserves full audit trail
- **Retryable failures**: Network errors, timeouts, HTTP 5xx, 429 Too Many Requests
- **Non-retryable failures**: HTTP 4xx (except 429), validation errors, user cancellation

### Worker Crashes
- Workers send heartbeats every 15 seconds
- The `StaleJobRecovery` service runs every 60 seconds
- If an execution has `status = Running` and `heartbeat_at < now() - 60s`, it's presumed abandoned
- The execution is marked `Failed` with error "Worker heartbeat expired"
- If retries remain, a new execution is automatically enqueued

### State Machine

```
                    ┌────────────┐
                    │   PENDING  │
                    └──────┬─────┘
                           │ Worker picks up
                    ┌──────▼─────┐
              ┌─────│   RUNNING  │─────┐
              │     └──────┬─────┘     │
              │            │           │
        ┌─────▼───┐  ┌────▼────┐  ┌───▼──────┐
        │  FAILED  │  │SUCCEEDED│  │ TIMED_OUT│
        └─────┬───┘  └─────────┘  └───┬──────┘
              │                        │
              └────────┬───────────────┘
                       │ Auto-retry or manual
                ┌──────▼─────┐
                │  PENDING   │ (new execution)
                └────────────┘

        CANCELLED ← Can come from PENDING or RUNNING (user action)
```

Valid transitions:
- `Pending → Running` (worker dequeue)
- `Running → Succeeded` (execution complete)
- `Running → Failed` (execution error)
- `Running → TimedOut` (timeout exceeded)
- `Pending → Cancelled` (user cancellation)
- `Running → Cancelled` (user cancellation)

Invalid transitions are rejected at the service layer.

## Database Decisions

### PostgreSQL as Queue
Already discussed above. The key index is `(Status, ScheduledAt)` on the executions table, which makes the dequeue query efficient.

### JSONB for Configuration
Job configurations vary by type (HTTP vs Webhook vs DataSync). Rather than multiple tables or columns, configurations are stored as JSONB. This is flexible, queryable (PostgreSQL JSONB operators), and avoids schema changes when adding new job types.

### Indexes
- `Executions(JobId, CreatedAt DESC)` — Fast execution history retrieval
- `Executions(Status, ScheduledAt)` — Efficient queue polling
- `Executions(IdempotencyKey)` — Fast idempotency checks (partial unique index)
- `Jobs(UserId)` — Fast per-user job listing
- `Jobs(IsActive, NextRunAt)` — Efficient scheduler queries

### Enum Storage
Enums are stored as strings in the database. This is slightly less space-efficient than integers but makes debugging much easier — you can read the data without a lookup table.

## Product Decisions

### Why a Dashboard?
Developers using a job automation tool need to know "is everything OK?" at a glance. The dashboard answers: how many jobs are running, what's the success rate, are any jobs failing, and are workers healthy.

### Why Execution Logs?
When a job fails, "it failed" isn't enough. Developers need to see what happened step by step: what request was sent, what response came back, where did it fail. Execution logs provide this timeline.

### Why Not a Full Cron UI Builder?
Cron expressions are the standard for scheduling. Most users of a job automation platform are developers who know cron syntax. A visual builder would be nice but is not essential — I provide common examples in the UI instead.

### Why Per-User Isolation?
Simple authorization model: users can only see and manage their own jobs. No teams or organizations — that's a future feature. This keeps the authorization logic straightforward and the security model tight.

## Known Limitations

1. **No WebSocket/SSE for real-time updates** — The frontend polls for execution status changes. For a production system, I'd add SignalR for live updates.

2. **No email/notification system** — When a job fails its final retry, the user only sees it in the dashboard. In production, you'd want email/Slack/PagerDuty notifications.

3. **Single database, no read replicas** — Dashboard queries and queue polling share the same database. At scale, you'd separate analytics queries to a read replica.

4. **No job dependencies/DAGs** — Jobs are independent. You can't say "run Job B after Job A succeeds." This is a common feature in mature job platforms.

5. **Script and DataSync types are stubs** — Only HTTP Request and Webhook are fully implemented. Script execution would require sandboxing; DataSync would need connector configuration.

6. **No rate limiting** — The API doesn't rate-limit requests. In production, you'd add rate limiting per user/IP.

7. **Logs are not rotated** — Execution logs grow indefinitely. In production, you'd add retention policies and archival.

## What I Would Improve With More Time

### Short Term
- **SignalR for real-time execution updates** — Replace polling with push notifications
- **Job templates** — Pre-built configurations for common patterns (healthcheck, webhook relay)
- **Bulk operations** — Pause/resume/delete multiple jobs at once
- **Better cron UI** — Visual schedule builder with natural language preview
- **Execution log retention** — Auto-cleanup of logs older than 30 days

### Medium Term
- **Notification channels** — Email, Slack, webhook on failure
- **Job dependencies** — Simple DAG support (run B after A)
- **API rate limiting** — Per-user and per-endpoint limits
- **Monitoring integration** — Prometheus metrics, Grafana dashboards
- **Read replicas** — Separate analytics queries from operational queries

### Long Term
- **Multi-tenancy with teams** — Organizations, roles, shared jobs
- **Script execution sandboxing** — Run arbitrary scripts in containers
- **Distributed tracing** — OpenTelemetry integration
- **Geographic distribution** — Workers in multiple regions
- **Event-driven triggers** — Jobs triggered by events, not just schedules
