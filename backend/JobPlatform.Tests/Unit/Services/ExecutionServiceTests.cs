using JobPlatform.Core.Enums;
using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;
using JobPlatform.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace JobPlatform.Tests.Unit.Services;

public class ExecutionServiceTests
{
    private AppDbContext GetContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task Cancel_Pending_Success()
    {
        var ctx = GetContext();
        var userId = Guid.NewGuid();
        var job = new Job { UserId = userId, Name = "T" };
        var exec = new Execution { Job = job, Status = ExecutionStatus.Pending };
        ctx.Jobs.Add(job);
        ctx.Executions.Add(exec);
        await ctx.SaveChangesAsync();

        var svc = new ExecutionService(ctx);
        var res = await svc.CancelExecutionAsync(userId, exec.Id);
        
        Assert.Equal(ExecutionStatus.Cancelled, res.Status);
    }

    [Fact]
    public async Task Retry_Failed_CreatesNewExecution()
    {
        var ctx = GetContext();
        var userId = Guid.NewGuid();
        var job = new Job { UserId = userId, Name = "T" };
        var exec = new Execution { Job = job, Status = ExecutionStatus.Failed, AttemptNumber = 1 };
        ctx.Jobs.Add(job);
        ctx.Executions.Add(exec);
        await ctx.SaveChangesAsync();

        var svc = new ExecutionService(ctx);
        var res = await svc.RetryExecutionAsync(userId, exec.Id);
        
        Assert.Equal(ExecutionStatus.Pending, res.Status);
        Assert.Equal(2, res.AttemptNumber);
        Assert.NotEqual(exec.Id, res.Id);
    }

    [Fact]
    public async Task Retry_Pending_ThrowsException()
    {
        var ctx = GetContext();
        var userId = Guid.NewGuid();
        var job = new Job { UserId = userId, Name = "T" };
        var exec = new Execution { Job = job, Status = ExecutionStatus.Pending };
        ctx.Jobs.Add(job);
        ctx.Executions.Add(exec);
        await ctx.SaveChangesAsync();

        var svc = new ExecutionService(ctx);
        await Assert.ThrowsAsync<InvalidOperationException>(() => svc.RetryExecutionAsync(userId, exec.Id));
    }
}
