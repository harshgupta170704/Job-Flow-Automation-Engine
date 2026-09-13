using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;
using JobPlatform.Worker.Services.Executors;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace JobPlatform.Tests.Unit.Executors;

public class HttpRequestExecutorTests
{
    private AppDbContext GetContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task Execute_InvalidConfig_ReturnsFalse()
    {
        var ctx = GetContext();
        var exec = new HttpRequestExecutor(ctx);
        
        var job = new Job { Configuration = "{}" };
        var execution = new Execution { Id = Guid.NewGuid() };
        
        var result = await exec.ExecuteAsync(job, execution, CancellationToken.None);
        
        Assert.False(result.Success);
        Assert.Equal("Invalid configuration", result.ErrorMessage);
    }
}
