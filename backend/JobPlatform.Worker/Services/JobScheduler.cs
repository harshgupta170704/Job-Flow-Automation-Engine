using Cronos;
using JobPlatform.Core.Interfaces;
using JobPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.Worker.Services;

public class JobScheduler : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public JobScheduler(IServiceProvider serviceProvider)
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

                var now = DateTime.UtcNow;
                var jobs = await context.Jobs
                    .Where(j => j.IsActive && j.ScheduleCron != null && j.NextRunAt <= now)
                    .ToListAsync(stoppingToken);

                foreach (var job in jobs)
                {
                    await queue.EnqueueAsync(job.Id, 1, now);
                    
                    try
                    {
                        var cron = CronExpression.Parse(job.ScheduleCron);
                        job.NextRunAt = cron.GetNextOccurrence(now);
                    }
                    catch
                    {
                        job.NextRunAt = null;
                        job.IsActive = false;
                    }
                }
                
                await context.SaveChangesAsync(stoppingToken);
            }

            await Task.Delay(30000, stoppingToken);
        }
    }
}
