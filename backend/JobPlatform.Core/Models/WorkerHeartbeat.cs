namespace JobPlatform.Core.Models;
public class WorkerHeartbeat
{
    public string WorkerId { get; set; } = string.Empty;
    public string Hostname { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastHeartbeatAt { get; set; } = DateTime.UtcNow;
    public int ActiveExecutions { get; set; } = 0;
    public string Status { get; set; } = "ONLINE";
}
