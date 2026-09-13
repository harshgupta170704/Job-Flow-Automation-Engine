using Cronos;
using JobPlatform.Core.DTOs.Requests;
using JobPlatform.Core.DTOs.Responses;
using JobPlatform.Core.Enums;
using JobPlatform.Core.Interfaces;
using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.Infrastructure.Services;

public class JobService : IJobService
{
    private readonly AppDbContext _context;

    public JobService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<(List<JobResponse> Items, int Total)> GetJobsAsync(Guid userId, string? search, string? type, string? status, int page, int pageSize)
    {
        var query = _context.Jobs.Where(j => j.UserId == userId);

        if (!string.IsNullOrEmpty(search))
            query = query.Where(j => j.Name.Contains(search));
        
        if (Enum.TryParse<JobType>(type, true, out var jobType))
            query = query.Where(j => j.JobType == jobType);

        var total = await query.CountAsync();
        var jobs = await query
            .OrderByDescending(j => j.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(j => new JobResponse
            {
                Id = j.Id,
                UserId = j.UserId,
                Name = j.Name,
                Description = j.Description,
                JobType = j.JobType,
                Configuration = j.Configuration,
                ScheduleCron = j.ScheduleCron,
                IsActive = j.IsActive,
                MaxRetries = j.MaxRetries,
                RetryDelaySeconds = j.RetryDelaySeconds,
                TimeoutSeconds = j.TimeoutSeconds,
                CreatedAt = j.CreatedAt,
                UpdatedAt = j.UpdatedAt,
                NextRunAt = j.NextRunAt,
                LastRunAt = j.LastRunAt,
                Version = j.Version,
                LastExecutionStatus = _context.Executions.Where(e => e.JobId == j.Id).OrderByDescending(e => e.CreatedAt).Select(e => e.Status.ToString()).FirstOrDefault(),
                TotalExecutions = _context.Executions.Count(e => e.JobId == j.Id)
            })
            .ToListAsync();

        return (jobs, total);
    }

    public async Task<JobResponse> GetJobAsync(Guid userId, Guid jobId)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId);
        if (job == null) throw new KeyNotFoundException("Job not found");
        return MapToResponse(job);
    }

    public async Task<JobResponse> CreateJobAsync(Guid userId, CreateJobRequest request)
    {
        var job = new Job
        {
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            JobType = request.JobType,
            Configuration = request.Configuration,
            ScheduleCron = request.ScheduleCron,
            MaxRetries = request.MaxRetries,
            RetryDelaySeconds = request.RetryDelaySeconds,
            TimeoutSeconds = request.TimeoutSeconds,
            NextRunAt = GetNextOccurrence(request.ScheduleCron)
        };

        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();
        return MapToResponse(job);
    }

    public async Task<JobResponse> UpdateJobAsync(Guid userId, Guid jobId, UpdateJobRequest request)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId);
        if (job == null) throw new KeyNotFoundException("Job not found");

        if (request.Name != null) job.Name = request.Name;
        if (request.Description != null) job.Description = request.Description;
        if (request.JobType.HasValue) job.JobType = request.JobType.Value;
        if (request.Configuration != null) job.Configuration = request.Configuration;
        if (request.ScheduleCron != null)
        {
            job.ScheduleCron = request.ScheduleCron;
            job.NextRunAt = GetNextOccurrence(request.ScheduleCron);
        }
        if (request.MaxRetries.HasValue) job.MaxRetries = request.MaxRetries.Value;
        if (request.RetryDelaySeconds.HasValue) job.RetryDelaySeconds = request.RetryDelaySeconds.Value;
        if (request.TimeoutSeconds.HasValue) job.TimeoutSeconds = request.TimeoutSeconds.Value;

        job.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return MapToResponse(job);
    }

    public async Task DeleteJobAsync(Guid userId, Guid jobId)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId);
        if (job != null)
        {
            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<JobResponse> ToggleJobAsync(Guid userId, Guid jobId)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId);
        if (job == null) throw new KeyNotFoundException("Job not found");

        job.IsActive = !job.IsActive;
        job.NextRunAt = job.IsActive ? GetNextOccurrence(job.ScheduleCron) : null;
        job.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return MapToResponse(job);
    }

    public async Task<ExecutionResponse> RunJobAsync(Guid userId, Guid jobId, RunJobRequest request)
    {
        var job = await _context.Jobs.FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId);
        if (job == null) throw new KeyNotFoundException("Job not found");

        var existing = await _context.Executions
            .FirstOrDefaultAsync(e => e.IdempotencyKey == request.IdempotencyKey && e.Status != ExecutionStatus.Cancelled && e.CreatedAt >= DateTime.UtcNow.AddMinutes(-5));
        
        if (existing != null) return MapToExecutionResponse(existing);

        var execution = new Execution
        {
            JobId = jobId,
            IdempotencyKey = request.IdempotencyKey,
            Status = ExecutionStatus.Pending,
            AttemptNumber = 1,
            ScheduledAt = DateTime.UtcNow
        };

        _context.Executions.Add(execution);
        await _context.SaveChangesAsync();
        return MapToExecutionResponse(execution);
    }

    private static DateTime? GetNextOccurrence(string? cron)
    {
        if (string.IsNullOrWhiteSpace(cron)) return null;
        try
        {
            var expression = CronExpression.Parse(cron);
            return expression.GetNextOccurrence(DateTime.UtcNow);
        }
        catch { return null; }
    }

    private static JobResponse MapToResponse(Job j) => new()
    {
        Id = j.Id, UserId = j.UserId, Name = j.Name, Description = j.Description,
        JobType = j.JobType, Configuration = j.Configuration, ScheduleCron = j.ScheduleCron,
        IsActive = j.IsActive, MaxRetries = j.MaxRetries, RetryDelaySeconds = j.RetryDelaySeconds,
        TimeoutSeconds = j.TimeoutSeconds, CreatedAt = j.CreatedAt, UpdatedAt = j.UpdatedAt,
        NextRunAt = j.NextRunAt, LastRunAt = j.LastRunAt, Version = j.Version
    };

    private static ExecutionResponse MapToExecutionResponse(Execution e) => new()
    {
        Id = e.Id, JobId = e.JobId, Status = e.Status, AttemptNumber = e.AttemptNumber,
        WorkerId = e.WorkerId, IdempotencyKey = e.IdempotencyKey, StartedAt = e.StartedAt,
        CompletedAt = e.CompletedAt, DurationMs = e.DurationMs, ResultStatusCode = e.ResultStatusCode,
        ResultBody = e.ResultBody, ErrorMessage = e.ErrorMessage, ErrorDetails = e.ErrorDetails,
        IsRetryable = e.IsRetryable, ScheduledAt = e.ScheduledAt, CreatedAt = e.CreatedAt
    };
}
