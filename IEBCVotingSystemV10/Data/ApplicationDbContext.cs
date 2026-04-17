using System;
using IEBCVotingSystemV10.Model;
using IEBCVotingSystemV10.Model.Entity;
using IEBCVotingSystemV10.Utils;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace IEBCVotingSystemV10.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, AppUserRoles, string>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    { }

    public DbSet<VoterModel> Voters { get; set; }
    public DbSet<CandidateModel> Candidates { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        // Any custom model configuration goes here

    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Look for ANY entity that implements IAuditable
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is IAuditable && (
                    e.State == EntityState.Added
                    || e.State == EntityState.Modified));

        foreach (var entityEntry in entries)
        {
            var auditable = (IAuditable)entityEntry.Entity;

            auditable.UpdatedAt = DateTime.UtcNow;

            if (entityEntry.State == EntityState.Added)
            {
                auditable.CreatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

}
