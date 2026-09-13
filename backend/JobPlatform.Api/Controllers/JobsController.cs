using JobPlatform.Core.DTOs.Requests;
using JobPlatform.Core.DTOs.Responses;
using JobPlatform.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobPlatform.Api.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobService;

    public JobsController(IJobService jobService)
    {
        _jobService = jobService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<JobResponse>>>> GetJobs([FromQuery] string? search, [FromQuery] string? type, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var (items, total) = await _jobService.GetJobsAsync(UserId, search, type, status, page, pageSize);
        return Ok(ApiResponse<IEnumerable<JobResponse>>.Paginated(items, total, page, pageSize));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<JobResponse>>> CreateJob(CreateJobRequest request)
    {
        var result = await _jobService.CreateJobAsync(UserId, request);
        return CreatedAtAction(nameof(GetJob), new { id = result.Id }, ApiResponse<JobResponse>.Success(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<JobResponse>>> GetJob(Guid id)
    {
        var result = await _jobService.GetJobAsync(UserId, id);
        return Ok(ApiResponse<JobResponse>.Success(result));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<JobResponse>>> UpdateJob(Guid id, UpdateJobRequest request)
    {
        var result = await _jobService.UpdateJobAsync(UserId, id, request);
        return Ok(ApiResponse<JobResponse>.Success(result));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteJob(Guid id)
    {
        await _jobService.DeleteJobAsync(UserId, id);
        return NoContent();
    }

    [HttpPost("{id}/run")]
    public async Task<ActionResult<ApiResponse<ExecutionResponse>>> RunJob(Guid id, RunJobRequest request)
    {
        var result = await _jobService.RunJobAsync(UserId, id, request);
        return Ok(ApiResponse<ExecutionResponse>.Success(result));
    }

    [HttpPost("{id}/toggle")]
    public async Task<ActionResult<ApiResponse<JobResponse>>> ToggleJob(Guid id)
    {
        var result = await _jobService.ToggleJobAsync(UserId, id);
        return Ok(ApiResponse<JobResponse>.Success(result));
    }
}
