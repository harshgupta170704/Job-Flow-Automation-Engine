using JobPlatform.Core.DTOs.Responses;
using JobPlatform.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobPlatform.Api.Controllers;

[ApiController]
[Authorize]
public class ExecutionsController : ControllerBase
{
    private readonly IExecutionService _executionService;

    public ExecutionsController(IExecutionService executionService)
    {
        _executionService = executionService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("api/jobs/{jobId}/executions")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ExecutionResponse>>>> GetJobExecutions(Guid jobId, [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var (items, total) = await _executionService.GetExecutionsAsync(UserId, jobId, status, page, pageSize);
        return Ok(ApiResponse<IEnumerable<ExecutionResponse>>.Paginated(items, total, page, pageSize));
    }

    [HttpGet("api/executions/{id}")]
    public async Task<ActionResult<ApiResponse<ExecutionDetailResponse>>> GetExecution(Guid id)
    {
        var result = await _executionService.GetExecutionAsync(UserId, id);
        return Ok(ApiResponse<ExecutionDetailResponse>.Success(result));
    }

    [HttpPost("api/executions/{id}/cancel")]
    public async Task<ActionResult<ApiResponse<ExecutionResponse>>> CancelExecution(Guid id)
    {
        var result = await _executionService.CancelExecutionAsync(UserId, id);
        return Ok(ApiResponse<ExecutionResponse>.Success(result));
    }

    [HttpPost("api/executions/{id}/retry")]
    public async Task<ActionResult<ApiResponse<ExecutionResponse>>> RetryExecution(Guid id)
    {
        var result = await _executionService.RetryExecutionAsync(UserId, id);
        return Ok(ApiResponse<ExecutionResponse>.Success(result));
    }
}
