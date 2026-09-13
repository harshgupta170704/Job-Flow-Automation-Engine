using JobPlatform.Core.Enums;

namespace JobPlatform.Core.Models;
public class Job
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public JobType JobType { get; set; }
    public string Configuration { get; set; } = string.Empty;
    public string? ScheduleCron { get; set; }
    public bool IsActive { get; set; } = true;
    public int MaxRetries { get; set; } = 3;
    public int RetryDelaySeconds { get; set; } = 10;
    public int TimeoutSeconds { get; set; } = 30;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? NextRunAt { get; set; }
    public DateTime? LastRunAt { get; set; }
    public int Version { get; set; } = 1;

    public User User { get; set; } = null!;
    public ICollection<Execution> Executions { get; set; } = new List<Execution>();
}
