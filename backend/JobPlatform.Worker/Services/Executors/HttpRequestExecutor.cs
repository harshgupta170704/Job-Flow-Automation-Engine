using System.Text;
using System.Text.Json;
using JobPlatform.Core.Interfaces;
using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;

namespace JobPlatform.Worker.Services.Executors;

public class HttpRequestExecutor : IJobExecutor
{
    private readonly HttpClient _httpClient = new();
    private readonly AppDbContext _context;

    public HttpRequestExecutor(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ExecutionResult> ExecuteAsync(Job job, Execution execution, CancellationToken ct)
    {
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var config = JsonSerializer.Deserialize<HttpRequestConfig>(job.Configuration, options);
        if (config == null || string.IsNullOrEmpty(config.Url))
            return new ExecutionResult(false, null, null, "Invalid configuration", null, false);

        _context.ExecutionLogs.Add(new ExecutionLog { ExecutionId = execution.Id, Message = $"Starting HTTP request to {config.Url}" });
        await _context.SaveChangesAsync(ct);

        var request = new HttpRequestMessage(new HttpMethod(config.Method ?? "GET"), config.Url);
        
        if (config.Headers != null)
        {
            foreach (var header in config.Headers)
                request.Headers.TryAddWithoutValidation(header.Key, header.Value);
        }

        if (!string.IsNullOrEmpty(config.Body))
            request.Content = new StringContent(config.Body, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.SendAsync(request, ct);
            var content = await response.Content.ReadAsStringAsync(ct);
            var statusCode = (int)response.StatusCode;

            _context.ExecutionLogs.Add(new ExecutionLog { ExecutionId = execution.Id, Message = $"Received response: {statusCode}" });
            await _context.SaveChangesAsync(ct);

            var isSuccess = response.IsSuccessStatusCode;
            var isRetryable = statusCode >= 500 || statusCode == 429;

            return new ExecutionResult(isSuccess, statusCode, content, isSuccess ? null : $"HTTP {statusCode}", null, isRetryable);
        }
        catch (HttpRequestException ex)
        {
            return new ExecutionResult(false, null, null, "Request failed", ex.Message, true);
        }
    }

    private class HttpRequestConfig
    {
        public string Url { get; set; } = string.Empty;
        public string Method { get; set; } = "GET";
        public Dictionary<string, string>? Headers { get; set; }
        public string? Body { get; set; }
    }
}
