using JobPlatform.Core.DTOs.Requests;
using JobPlatform.Core.DTOs.Responses;

namespace JobPlatform.Core.Interfaces;

public interface IJobService
{
    Task<(List<JobResponse> Items, int Total)> GetJobsAsync(Guid userId, string? search, string? type, string? status, int page, int pageSize);
    Task<JobResponse> GetJobAsync(Guid userId, Guid jobId);
    Task<JobResponse> CreateJobAsync(Guid userId, CreateJobRequest request);
    Task<JobResponse> UpdateJobAsync(Guid userId, Guid jobId, UpdateJobRequest request);
    Task DeleteJobAsync(Guid userId, Guid jobId);
    Task<JobResponse> ToggleJobAsync(Guid userId, Guid jobId);
    Task<ExecutionResponse> RunJobAsync(Guid userId, Guid jobId, RunJobRequest request);
}
