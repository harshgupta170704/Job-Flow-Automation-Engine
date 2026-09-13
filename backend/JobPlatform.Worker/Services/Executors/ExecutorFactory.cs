using JobPlatform.Core.Enums;
using JobPlatform.Core.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace JobPlatform.Worker.Services.Executors;

public class ExecutorFactory
{
    private readonly IServiceProvider _serviceProvider;

    public ExecutorFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IJobExecutor GetExecutor(JobType jobType)
    {
        return jobType switch
        {
            JobType.HttpRequest => _serviceProvider.GetRequiredService<HttpRequestExecutor>(),
            JobType.Webhook => _serviceProvider.GetRequiredService<WebhookExecutor>(),
            JobType.DataSync or JobType.Script => throw new NotSupportedException($"Executor for {jobType} is not supported yet."),
            _ => throw new NotSupportedException($"Unknown job type: {jobType}")
        };
    }
}
