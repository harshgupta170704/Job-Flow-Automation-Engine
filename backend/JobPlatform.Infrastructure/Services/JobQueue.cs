using JobPlatform.Core.Enums;
using JobPlatform.Core.Interfaces;
using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.Infrastructure.Services;

public class JobQueue : IJobQueue
{
    private readonly AppDbContext _context;

    public JobQueue(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Execution?> DequeueAsync(string workerId, CancellationToken ct)
    {
        using var transaction = await _context.Database.BeginTransactionAsync(ct);
        try
        {
            var execution = await _context.Executions
                .FromSqlRaw(@"
                    SELECT * FROM ""Executions"" 
                    WHERE ""Status"" = 'Pending' 
                    AND ""ScheduledAt"" <= now() 
                    ORDER BY ""ScheduledAt"" 
                    LIMIT 1 
                    FOR UPDATE SKIP LOCKED")
                .FirstOrDefaultAsync(ct);
            
            if (execution == null)
            {
                await transaction.CommitAsync(ct);
                return null;
            }
            
            execution.Status = ExecutionStatus.Running;
            execution.WorkerId = workerId;
            execution.StartedAt = DateTime.UtcNow;
            execution.HeartbeatAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            
            return execution;
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task EnqueueAsync(Guid jobId, int attemptNumber, DateTime scheduledAt, string? idempotencyKey = null)
    {
        _context.Executions.Add(new Execution
        {
            JobId = jobId,
            AttemptNumber = attemptNumber,
            ScheduledAt = scheduledAt,
            IdempotencyKey = idempotencyKey,
            Status = ExecutionStatus.Pending
        });
        await _context.SaveChangesAsync();
    }

    public async Task HeartbeatAsync(Guid executionId)
    {
        await _context.Executions
            .Where(e => e.Id == executionId)
            .ExecuteUpdateAsync(s => s.SetProperty(e => e.HeartbeatAt, DateTime.UtcNow));
    }

    public async Task CompleteAsync(Guid executionId, ExecutionStatus status, int? statusCode, string? resultBody, string? errorMessage, string? errorDetails, bool isRetryable)
    {
        var exec = await _context.Executions.Include(e => e.Job).FirstOrDefaultAsync(e => e.Id == executionId);
        if (exec != null)
        {
            exec.Status = status;
            exec.ResultStatusCode = statusCode;
            exec.ResultBody = resultBody;
            exec.ErrorMessage = errorMessage;
            exec.ErrorDetails = errorDetails;
            exec.IsRetryable = isRetryable;
            exec.CompletedAt = DateTime.UtcNow;
            exec.DurationMs = exec.StartedAt.HasValue ? (int)(DateTime.UtcNow - exec.StartedAt.Value).TotalMilliseconds : 0;
            
            exec.Job.LastRunAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
