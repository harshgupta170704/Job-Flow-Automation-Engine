using System.ComponentModel.DataAnnotations;
using JobPlatform.Core.Enums;

namespace JobPlatform.Core.DTOs.Requests;

public class CreateJobRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    [Required]
    public JobType JobType { get; set; }
    [Required]
    public string Configuration { get; set; } = string.Empty;
    public string? ScheduleCron { get; set; }
    [Range(0, 10)]
    public int MaxRetries { get; set; } = 3;
    [Range(1, 300)]
    public int RetryDelaySeconds { get; set; } = 10;
    [Range(5, 300)]
    public int TimeoutSeconds { get; set; } = 30;
}

public class UpdateJobRequest
{
    [MaxLength(200)]
    public string? Name { get; set; }
    public string? Description { get; set; }
    public JobType? JobType { get; set; }
    public string? Configuration { get; set; }
    public string? ScheduleCron { get; set; }
    [Range(0, 10)]
    public int? MaxRetries { get; set; }
    [Range(1, 300)]
    public int? RetryDelaySeconds { get; set; }
    [Range(5, 300)]
    public int? TimeoutSeconds { get; set; }
}

public class RunJobRequest
{
    [Required]
    public string IdempotencyKey { get; set; } = string.Empty;
}
