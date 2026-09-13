using JobPlatform.Core.Models;

namespace JobPlatform.Core.Interfaces;

public interface IJobExecutor
{
    Task<ExecutionResult> ExecuteAsync(Job job, Execution execution, CancellationToken ct);
}
