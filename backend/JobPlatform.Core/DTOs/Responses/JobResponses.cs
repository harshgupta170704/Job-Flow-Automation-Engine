using JobPlatform.Core.Enums;

namespace JobPlatform.Core.DTOs.Responses;

public class JobResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public JobType JobType { get; set; }
    public string Configuration { get; set; } = string.Empty;
    public string? ScheduleCron { get; set; }
    public bool IsActive { get; set; }
    public int MaxRetries { get; set; }
    public int RetryDelaySeconds { get; set; }
    public int TimeoutSeconds { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? NextRunAt { get; set; }
    public DateTime? LastRunAt { get; set; }
    public int Version { get; set; }
    
    public string? LastExecutionStatus { get; set; }
    public int TotalExecutions { get; set; }
    public double? SuccessRate { get; set; }
}

public class ExecutionResponse
{
    public Guid Id { get; set; }
    public Guid JobId { get; set; }
    public ExecutionStatus Status { get; set; }
    public int AttemptNumber { get; set; }
    public string? WorkerId { get; set; }
    public string? IdempotencyKey { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? DurationMs { get; set; }
    public int? ResultStatusCode { get; set; }
    public string? ResultBody { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorDetails { get; set; }
    public bool IsRetryable { get; set; }
    public DateTime ScheduledAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ExecutionDetailResponse : ExecutionResponse
{
    public List<ExecutionLogResponse> Logs { get; set; } = new();
}

public class ExecutionLogResponse
{
    public long Id { get; set; }
    public DateTime Timestamp { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? Metadata { get; set; }
}

public class DashboardStatsResponse
{
    public int TotalJobs { get; set; }
    public int ActiveJobs { get; set; }
    public int JobsNeedingAttention { get; set; }
    public int TotalExecutions24h { get; set; }
    public int SuccessfulExecutions24h { get; set; }
    public int FailedExecutions24h { get; set; }
    public double SuccessRate24h { get; set; }
    public double SuccessRate7d { get; set; }
    public int WorkersOnline { get; set; }
}
