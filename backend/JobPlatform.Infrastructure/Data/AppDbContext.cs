using JobPlatform.Core.Models;
using Microsoft.EntityFrameworkCore;
using JobPlatform.Core.Enums;

namespace JobPlatform.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Job> Jobs => Set<Job>();
    public DbSet<Execution> Executions => Set<Execution>();
    public DbSet<ExecutionLog> ExecutionLogs => Set<ExecutionLog>();
    public DbSet<WorkerHeartbeat> WorkerHeartbeats => Set<WorkerHeartbeat>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(b =>
        {
            b.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<Job>(b =>
        {
            b.HasIndex(j => j.UserId);
            b.HasIndex(j => new { j.IsActive, j.NextRunAt });
            b.HasIndex(j => j.JobType);
            b.Property(j => j.Version).IsConcurrencyToken();
            b.Property(j => j.JobType).HasConversion<string>();
        });

        modelBuilder.Entity<Execution>(b =>
        {
            b.HasIndex(e => new { e.JobId, e.CreatedAt }).IsDescending(false, true);
            b.HasIndex(e => new { e.Status, e.ScheduledAt });
            b.HasIndex(e => e.IdempotencyKey).HasFilter("\"Status\" != 'Cancelled'");
            b.Property(e => e.Status).HasConversion<string>();
        });

        modelBuilder.Entity<ExecutionLog>(b =>
        {
            b.HasIndex(l => new { l.ExecutionId, l.Timestamp });
        });

        modelBuilder.Entity<WorkerHeartbeat>(b =>
        {
            b.HasKey(w => w.WorkerId);
        });
    }
}
