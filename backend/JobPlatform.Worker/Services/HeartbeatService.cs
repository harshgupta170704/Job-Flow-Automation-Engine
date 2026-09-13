using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.Worker.Services;

public class HeartbeatService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public HeartbeatService(IServiceProvider serviceProvider)
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
                var processor = scope.ServiceProvider.GetRequiredService<IEnumerable<IHostedService>>().OfType<JobQueueProcessor>().FirstOrDefault();
                
                if (processor != null)
                {
                    var heartbeat = await context.WorkerHeartbeats.FindAsync(new object[] { processor.WorkerId }, stoppingToken);
                    if (heartbeat == null)
                    {
                        context.WorkerHeartbeats.Add(new WorkerHeartbeat
                        {
                            WorkerId = processor.WorkerId,
                            Hostname = Environment.MachineName,
                            StartedAt = DateTime.UtcNow,
                            LastHeartbeatAt = DateTime.UtcNow,
                            Status = "ONLINE"
                        });
                    }
                    else
                    {
                        heartbeat.LastHeartbeatAt = DateTime.UtcNow;
                    }
                    await context.SaveChangesAsync(stoppingToken);
                }
            }

            await Task.Delay(15000, stoppingToken);
        }
    }
}
