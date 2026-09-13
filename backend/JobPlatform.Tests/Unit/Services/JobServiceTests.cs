using JobPlatform.Core.DTOs.Requests;
using JobPlatform.Core.Enums;
using JobPlatform.Core.Models;
using JobPlatform.Infrastructure.Data;
using JobPlatform.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace JobPlatform.Tests.Unit.Services;

public class JobServiceTests
{
    private AppDbContext GetContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateJob_ValidInput_Success()
    {
        var ctx = GetContext();
        var svc = new JobService(ctx);
        var userId = Guid.NewGuid();
        
        var req = new CreateJobRequest { Name = "Test", JobType = JobType.HttpRequest, Configuration = "{}" };
        var res = await svc.CreateJobAsync(userId, req);
        
        Assert.NotNull(res);
        Assert.Equal("Test", res.Name);
        Assert.Equal(userId, res.UserId);
    }

    [Fact]
    public async Task CreateJob_WithCron_ComputesNextRunAt()
    {
        var ctx = GetContext();
        var svc = new JobService(ctx);
        var req = new CreateJobRequest { Name = "Test", JobType = JobType.HttpRequest, Configuration = "{}", ScheduleCron = "0 0 * * *" };
        
        var res = await svc.CreateJobAsync(Guid.NewGuid(), req);
        
        Assert.NotNull(res.NextRunAt);
    }

    [Fact]
    public async Task GetJob_WrongUser_ThrowsKeyNotFound()
    {
        var ctx = GetContext();
        var job = new Job { UserId = Guid.NewGuid(), Name = "T", Configuration = "{}" };
        ctx.Jobs.Add(job);
        await ctx.SaveChangesAsync();
        
        var svc = new JobService(ctx);
        
        await Assert.ThrowsAsync<KeyNotFoundException>(() => svc.GetJobAsync(Guid.NewGuid(), job.Id));
    }

    [Fact]
    public async Task RunJob_IdempotencyKey_ReturnsExisting()
    {
        var ctx = GetContext();
        var userId = Guid.NewGuid();
        var job = new Job { UserId = userId, Name = "T", Configuration = "{}" };
        ctx.Jobs.Add(job);
        var exec = new Execution { JobId = job.Id, IdempotencyKey = "key1", Status = ExecutionStatus.Pending, CreatedAt = DateTime.UtcNow };
        ctx.Executions.Add(exec);
        await ctx.SaveChangesAsync();
        
        var svc = new JobService(ctx);
        var res = await svc.RunJobAsync(userId, job.Id, new RunJobRequest { IdempotencyKey = "key1" });
        
        Assert.Equal(exec.Id, res.Id);
    }
}
