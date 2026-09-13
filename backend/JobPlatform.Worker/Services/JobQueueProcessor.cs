using JobPlatform.Core.Enums;
using JobPlatform.Core.Interfaces;
using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;
using JobPlatform.Worker.Services.Executors;
using Microsoft.EntityFrameworkCore;

namespace JobPlatform.Worker.Services;

public class JobQueueProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<JobQueueProcessor> _logger;
    private readonly string _workerId;
    private readonly SemaphoreSlim _semaphore = new(5, 5);

    public JobQueueProcessor(IServiceProvider serviceProvider, ILogger<JobQueueProcessor> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _workerId = $"{Environment.MachineName}-{Guid.NewGuid()}";
    }

    public string WorkerId => _workerId;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Worker {WorkerId} started.", _workerId);

        while (!stoppingToken.IsCancellationRequested)
        {
            await _semaphore.WaitAsync(stoppingToken);

            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var queue = scope.ServiceProvider.GetRequiredService<IJobQueue>();
                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                    var factory = scope.ServiceProvider.GetRequiredService<ExecutorFactory>();

                    var execution = await queue.DequeueAsync(_workerId, stoppingToken);
                    if (execution == null)
                    {
                        await Task.Delay(2000, stoppingToken);
                        return;
                    }

                    var job = await context.Jobs.FindAsync(new object[] { execution.JobId }, stoppingToken);
                    if (job == null) return;

                    var executor = factory.GetExecutor(job.JobType);
                    
                    using var cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
                    cts.CancelAfter(TimeSpan.FromSeconds(job.TimeoutSeconds));

                    try
                    {
                        var result = await executor.ExecuteAsync(job, execution, cts.Token);
                        if (result.Success)
                        {
                            await queue.CompleteAsync(execution.Id, ExecutionStatus.Succeeded, result.StatusCode, result.ResponseBody, null, null, false);
                        }
                        else
                        {
                            await HandleFailureAsync(queue, job, execution, result.StatusCode, result.ErrorMessage, result.ErrorDetails, result.IsRetryable);
                        }
                    }
                    catch (OperationCanceledException) when (!stoppingToken.IsCancellationRequested)
                    {
                        await queue.CompleteAsync(execution.Id, ExecutionStatus.TimedOut, null, null, "Execution timed out", null, true);
                        if (execution.AttemptNumber < job.MaxRetries)
                        {
                            var delaySecs = Math.Min(300, job.RetryDelaySeconds * (int)Math.Pow(2, execution.AttemptNumber - 1));
                            await queue.EnqueueAsync(job.Id, execution.AttemptNumber + 1, DateTime.UtcNow.AddSeconds(delaySecs), execution.IdempotencyKey);
                        }
                    }
                    catch (Exception ex)
                    {
                        await HandleFailureAsync(queue, job, execution, null, ex.Message, ex.StackTrace, true);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing job queue.");
                }
                finally
                {
                    _semaphore.Release();
                }
            }, stoppingToken);

            await Task.Delay(100, stoppingToken);
        }
    }

    private async Task HandleFailureAsync(IJobQueue queue, Job job, Execution execution, int? statusCode, string? errorMessage, string? errorDetails, bool isRetryable)
    {
        await queue.CompleteAsync(execution.Id, ExecutionStatus.Failed, statusCode, null, errorMessage, errorDetails, isRetryable);

        if (isRetryable && execution.AttemptNumber < job.MaxRetries)
        {
            var delaySecs = Math.Min(300, job.RetryDelaySeconds * (int)Math.Pow(2, execution.AttemptNumber - 1));
            await queue.EnqueueAsync(job.Id, execution.AttemptNumber + 1, DateTime.UtcNow.AddSeconds(delaySecs), execution.IdempotencyKey);
        }
    }
}
