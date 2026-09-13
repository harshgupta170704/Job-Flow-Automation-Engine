using JobPlatform.Core.Enums;

namespace JobPlatform.Core.Models;
public class Execution
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid JobId { get; set; }
    public ExecutionStatus Status { get; set; } = ExecutionStatus.Pending;
    public int AttemptNumber { get; set; } = 1;
    public string? WorkerId { get; set; }
    public string? IdempotencyKey { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? DurationMs { get; set; }
    public int? ResultStatusCode { get; set; }
    public string? ResultBody { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorDetails { get; set; }
    public bool IsRetryable { get; set; } = true;
    public DateTime ScheduledAt { get; set; } = DateTime.UtcNow;
    public DateTime? HeartbeatAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Job Job { get; set; } = null!;
    public ICollection<ExecutionLog> Logs { get; set; } = new List<ExecutionLog>();
}
