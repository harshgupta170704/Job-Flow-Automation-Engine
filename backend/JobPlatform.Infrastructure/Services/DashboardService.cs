using JobPlatform.Core.DTOs.Responses;
using JobPlatform.Core.Enums;
using JobPlatform.Core.Interfaces;
using JobPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsResponse> GetStatsAsync(Guid userId)
    {
        var jobs = _context.Jobs.Where(j => j.UserId == userId);
        var execs = _context.Executions.Where(e => e.Job.UserId == userId);
        
        var d24h = DateTime.UtcNow.AddDays(-1);
        var d7d = DateTime.UtcNow.AddDays(-7);

        var totalJobs = await jobs.CountAsync();
        var activeJobs = await jobs.CountAsync(j => j.IsActive);
        var totalExecs24h = await execs.CountAsync(e => e.CreatedAt >= d24h);
        var succExecs24h = await execs.CountAsync(e => e.CreatedAt >= d24h && e.Status == ExecutionStatus.Succeeded);
        var failExecs24h = await execs.CountAsync(e => e.CreatedAt >= d24h && e.Status == ExecutionStatus.Failed);
        
        var totalExecs7d = await execs.CountAsync(e => e.CreatedAt >= d7d);
        var succExecs7d = await execs.CountAsync(e => e.CreatedAt >= d7d && e.Status == ExecutionStatus.Succeeded);

        return new DashboardStatsResponse
        {
            TotalJobs = totalJobs,
            ActiveJobs = activeJobs,
            JobsNeedingAttention = await jobs.CountAsync(j => j.IsActive && j.Executions.OrderByDescending(e => e.CreatedAt).FirstOrDefault()!.Status == ExecutionStatus.Failed),
            TotalExecutions24h = totalExecs24h,
            SuccessfulExecutions24h = succExecs24h,
            FailedExecutions24h = failExecs24h,
            SuccessRate24h = totalExecs24h > 0 ? (double)succExecs24h / totalExecs24h * 100 : 0,
            SuccessRate7d = totalExecs7d > 0 ? (double)succExecs7d / totalExecs7d * 100 : 0,
            WorkersOnline = await _context.WorkerHeartbeats.CountAsync(w => w.LastHeartbeatAt >= DateTime.UtcNow.AddMinutes(-2))
        };
    }

    public async Task<List<ExecutionResponse>> GetRecentExecutionsAsync(Guid userId, int count = 20)
    {
        return await _context.Executions
            .Where(e => e.Job.UserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .Take(count)
            .Select(e => new ExecutionResponse
            {
                Id = e.Id, JobId = e.JobId, Status = e.Status, AttemptNumber = e.AttemptNumber,
                WorkerId = e.WorkerId, IdempotencyKey = e.IdempotencyKey, StartedAt = e.StartedAt,
                CompletedAt = e.CompletedAt, DurationMs = e.DurationMs, ResultStatusCode = e.ResultStatusCode,
                ResultBody = e.ResultBody, ErrorMessage = e.ErrorMessage, ErrorDetails = e.ErrorDetails,
                IsRetryable = e.IsRetryable, ScheduledAt = e.ScheduledAt, CreatedAt = e.CreatedAt
            })
            .ToListAsync();
    }
}
