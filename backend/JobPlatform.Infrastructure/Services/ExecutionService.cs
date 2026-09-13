using JobPlatform.Core.DTOs.Responses;
using JobPlatform.Core.Enums;
using JobPlatform.Core.Interfaces;
using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.Infrastructure.Services;

public class ExecutionService : IExecutionService
{
    private readonly AppDbContext _context;

    public ExecutionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(List<ExecutionResponse> Items, int Total)> GetExecutionsAsync(Guid userId, Guid jobId, string? status, int page, int pageSize)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId);
        if (job == null) throw new KeyNotFoundException("Job not found");

        var query = _context.Executions.Where(e => e.JobId == jobId);
        if (Enum.TryParse<ExecutionStatus>(status, true, out var execStatus))
            query = query.Where(e => e.Status == execStatus);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(e => MapToResponse(e))
            .ToListAsync();

        return (items, total);
    }

    public async Task<ExecutionDetailResponse> GetExecutionAsync(Guid userId, Guid executionId)
    {
        var exec = await _context.Executions
            .Include(e => e.Logs.OrderBy(l => l.Timestamp))
            .Include(e => e.Job)
            .FirstOrDefaultAsync(e => e.Id == executionId);

        if (exec == null || exec.Job.UserId != userId) throw new KeyNotFoundException("Execution not found");

        var res = new ExecutionDetailResponse
        {
            Id = exec.Id, JobId = exec.JobId, Status = exec.Status, AttemptNumber = exec.AttemptNumber,
            WorkerId = exec.WorkerId, IdempotencyKey = exec.IdempotencyKey, StartedAt = exec.StartedAt,
            CompletedAt = exec.CompletedAt, DurationMs = exec.DurationMs, ResultStatusCode = exec.ResultStatusCode,
            ResultBody = exec.ResultBody, ErrorMessage = exec.ErrorMessage, ErrorDetails = exec.ErrorDetails,
            IsRetryable = exec.IsRetryable, ScheduledAt = exec.ScheduledAt, CreatedAt = exec.CreatedAt,
            Logs = exec.Logs.Select(l => new ExecutionLogResponse { Id = l.Id, Timestamp = l.Timestamp, Level = l.Level, Message = l.Message, Metadata = l.Metadata }).ToList()
        };
        return res;
    }

    public async Task<ExecutionResponse> CancelExecutionAsync(Guid userId, Guid executionId)
    {
        var exec = await _context.Executions.Include(e => e.Job).FirstOrDefaultAsync(e => e.Id == executionId);
        if (exec == null || exec.Job.UserId != userId) throw new KeyNotFoundException("Execution not found");

        if (exec.Status is ExecutionStatus.Pending or ExecutionStatus.Running)
        {
            exec.Status = ExecutionStatus.Cancelled;
            await _context.SaveChangesAsync();
        }
        return MapToResponse(exec);
    }

    public async Task<ExecutionResponse> RetryExecutionAsync(Guid userId, Guid executionId)
    {
        var exec = await _context.Executions.Include(e => e.Job).FirstOrDefaultAsync(e => e.Id == executionId);
        if (exec == null || exec.Job.UserId != userId) throw new KeyNotFoundException("Execution not found");

        if (exec.Status is not (ExecutionStatus.Failed or ExecutionStatus.TimedOut))
            throw new InvalidOperationException("Can only retry failed or timed out executions");

        var newExec = new Execution
        {
            JobId = exec.JobId,
            Status = ExecutionStatus.Pending,
            AttemptNumber = exec.AttemptNumber + 1,
            ScheduledAt = DateTime.UtcNow
        };
        _context.Executions.Add(newExec);
        await _context.SaveChangesAsync();
        return MapToResponse(newExec);
    }

    private static ExecutionResponse MapToResponse(Execution e) => new()
    {
        Id = e.Id, JobId = e.JobId, Status = e.Status, AttemptNumber = e.AttemptNumber,
        WorkerId = e.WorkerId, IdempotencyKey = e.IdempotencyKey, StartedAt = e.StartedAt,
        CompletedAt = e.CompletedAt, DurationMs = e.DurationMs, ResultStatusCode = e.ResultStatusCode,
        ResultBody = e.ResultBody, ErrorMessage = e.ErrorMessage, ErrorDetails = e.ErrorDetails,
        IsRetryable = e.IsRetryable, ScheduledAt = e.ScheduledAt, CreatedAt = e.CreatedAt
    };
}
