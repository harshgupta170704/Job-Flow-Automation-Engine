using JobPlatform.Core.Enums;
using JobPlatform.Core.Interfaces;
using JobPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.Worker.Services;

public class StaleJobRecovery : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public StaleJobRecovery(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var queue = scope.ServiceProvider.GetRequiredService<IJobQueue>();

                var staleLimit = DateTime.UtcNow.AddMinutes(-1);
                var staleExecutions = await context.Executions
                    .Where(e => e.Status == ExecutionStatus.Running && e.HeartbeatAt < staleLimit)
                    .Include(e => e.Job)
                    .ToListAsync(stoppingToken);

                foreach (var exec in staleExecutions)
                {
                    await queue.CompleteAsync(exec.Id, ExecutionStatus.Failed, null, null, "Worker heartbeat expired", null, true);
                    
                    if (exec.AttemptNumber < exec.Job.MaxRetries)
                    {
                        await queue.EnqueueAsync(exec.Job.Id, exec.AttemptNumber + 1, DateTime.UtcNow);
                    }
                }
            }

            await Task.Delay(60000, stoppingToken);
        }
    }
}
