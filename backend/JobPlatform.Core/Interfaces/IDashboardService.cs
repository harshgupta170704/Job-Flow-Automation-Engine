using JobPlatform.Core.DTOs.Responses;

namespace JobPlatform.Core.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsResponse> GetStatsAsync(Guid userId);
    Task<List<ExecutionResponse>> GetRecentExecutionsAsync(Guid userId, int count = 20);
}
