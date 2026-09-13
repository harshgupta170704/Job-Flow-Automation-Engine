using JobPlatform.Core.Interfaces;
using JobPlatform.Infrastructure.Data;
using JobPlatform.Infrastructure.Services;
using JobPlatform.Worker.Services;
using JobPlatform.Worker.Services.Executors;
using Microsoft.EntityFrameworkCore;

var builder = Host.CreateDefaultBuilder(args);

builder.ConfigureServices((context, services) =>
{
    var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") ?? context.Configuration.GetConnectionString("DefaultConnection");
    services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

    services.AddScoped<IJobQueue, JobQueue>();
    services.AddScoped<ExecutorFactory>();
    services.AddTransient<HttpRequestExecutor>();
    services.AddTransient<WebhookExecutor>();

    services.AddHostedService<JobQueueProcessor>();
    services.AddHostedService<JobScheduler>();
    services.AddHostedService<HeartbeatService>();
    services.AddHostedService<StaleJobRecovery>();
});

var host = builder.Build();
host.Run();
