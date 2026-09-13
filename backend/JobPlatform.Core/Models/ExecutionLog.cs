namespace JobPlatform.Core.Models;
public class ExecutionLog
{
    public long Id { get; set; }
    public Guid ExecutionId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Level { get; set; } = "INFO";
    public string Message { get; set; } = string.Empty;
    public string? Metadata { get; set; }
    
    public Execution Execution { get; set; } = null!;
}
