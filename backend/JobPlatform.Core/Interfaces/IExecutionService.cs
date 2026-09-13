using JobPlatform.Core.DTOs.Responses;

namespace JobPlatform.Core.Interfaces;

public interface IExecutionService
{
    Task<(List<ExecutionResponse> Items, int Total)> GetExecutionsAsync(Guid userId, Guid jobId, string? status, int page, int pageSize);
    Task<ExecutionDetailResponse> GetExecutionAsync(Guid userId, Guid executionId);
    Task<ExecutionResponse> CancelExecutionAsync(Guid userId, Guid executionId);
    Task<ExecutionResponse> RetryExecutionAsync(Guid userId, Guid executionId);
}
