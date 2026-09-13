using JobPlatform.Core.DTOs.Responses;
using JobPlatform.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobPlatform.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<DashboardStatsResponse>>> GetStats()
    {
        var result = await _dashboardService.GetStatsAsync(UserId);
        return Ok(ApiResponse<DashboardStatsResponse>.Success(result));
    }

    [HttpGet("recent")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ExecutionResponse>>>> GetRecent()
    {
        var result = await _dashboardService.GetRecentExecutionsAsync(UserId);
        return Ok(ApiResponse<IEnumerable<ExecutionResponse>>.Success(result));
    }
}
