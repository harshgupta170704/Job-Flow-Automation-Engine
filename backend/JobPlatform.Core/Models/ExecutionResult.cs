namespace JobPlatform.Core.Models;
public record ExecutionResult(bool Success, int? StatusCode, string? ResponseBody, string? ErrorMessage, string? ErrorDetails, bool IsRetryable);
