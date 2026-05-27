using Microsoft.EntityFrameworkCore;
using SipCore.Core.Models;

namespace SipCore.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<StudyHistory> StudyHistories => Set<StudyHistory>();
    public DbSet<EnglishHubState> EnglishHubStates => Set<EnglishHubState>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Student>().HasKey(s => s.Id);
        modelBuilder.Entity<Teacher>().HasKey(t => t.Id);
        modelBuilder.Entity<StudyHistory>().HasKey(h => h.Id);

        modelBuilder.Entity<EnglishHubState>().HasKey(e => e.Id);
        modelBuilder.Entity<EnglishHubState>()
            .Property(e => e.Id)
            .HasColumnName("id");
        modelBuilder.Entity<EnglishHubState>()
            .Property(e => e.StateKey)
            .HasColumnName("state_key")
            .HasMaxLength(32)
            .IsRequired();
        modelBuilder.Entity<EnglishHubState>()
            .HasIndex(e => e.StateKey)
            .IsUnique();
        modelBuilder.Entity<EnglishHubState>()
            .Property(e => e.PayloadJson)
            .HasColumnName("payload_json")
            .HasColumnType("longtext");
        modelBuilder.Entity<EnglishHubState>()
            .Property(e => e.UpdatedAt)
            .HasColumnName("updated_at")
            .IsRequired();
        modelBuilder.Entity<EnglishHubState>()
            .ToTable("english_hub_state");
    }
}
