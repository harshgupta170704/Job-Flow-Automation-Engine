using System.Text;
using System.Text.Json;
using JobPlatform.Core.Interfaces;
using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;

namespace JobPlatform.Worker.Services.Executors;

public class WebhookExecutor : IJobExecutor
{
    private readonly HttpClient _httpClient = new();
    private readonly AppDbContext _context;

    public WebhookExecutor(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ExecutionResult> ExecuteAsync(Job job, Execution execution, CancellationToken ct)
    {
        var config = JsonSerializer.Deserialize<WebhookConfig>(job.Configuration);
        if (config == null || string.IsNullOrEmpty(config.Url))
            return new ExecutionResult(false, null, null, "Invalid configuration", null, false);

        _context.ExecutionLogs.Add(new ExecutionLog { ExecutionId = execution.Id, Message = $"Sending webhook to {config.Url}" });
        await _context.SaveChangesAsync(ct);

        var request = new HttpRequestMessage(HttpMethod.Post, config.Url);
        
        if (config.Headers != null)
        {
            foreach (var header in config.Headers)
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        var payload = config.Payload ?? "{}";
        request.Content = new StringContent(payload, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.SendAsync(request, ct);
            var content = await response.Content.ReadAsStringAsync(ct);
            var statusCode = (int)response.StatusCode;

            var isSuccess = response.IsSuccessStatusCode;
            var isRetryable = statusCode >= 500 || statusCode == 429;

            return new ExecutionResult(isSuccess, statusCode, content, isSuccess ? null : $"HTTP {statusCode}", null, isRetryable);
        }
        catch (Exception ex)
        {
            return new ExecutionResult(false, null, null, "Webhook failed", ex.Message, true);
        }
    }

    private class WebhookConfig
    {
        public string Url { get; set; } = string.Empty;
        public Dictionary<string, string>? Headers { get; set; }
        public string? Payload { get; set; }
    }
}
