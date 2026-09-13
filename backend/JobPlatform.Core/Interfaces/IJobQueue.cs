using JobPlatform.Core.Enums;
using JobPlatform.Core.Models;

namespace JobPlatform.Core.Interfaces;

public interface IJobQueue
{
    Task<Execution?> DequeueAsync(string workerId, CancellationToken ct);
    Task EnqueueAsync(Guid jobId, int attemptNumber, DateTime scheduledAt, string? idempotencyKey = null);
    Task HeartbeatAsync(Guid executionId);
    Task CompleteAsync(Guid executionId, ExecutionStatus status, int? statusCode, string? resultBody, string? errorMessage, string? errorDetails, bool isRetryable);
}
