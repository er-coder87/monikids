using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Models;

public partial class PostgresContext : DbContext
{
    public PostgresContext()
    {
    }

    public PostgresContext(DbContextOptions<PostgresContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Budget> Budgets { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Chore> Chores { get; set; }

    public virtual DbSet<GoodDeed> GoodDeeds { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "pgjwt")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("graphql", "pg_graphql")
            .HasPostgresExtension("vault", "supabase_vault");

        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Budgets_pkey");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Amount).HasColumnName("amount");
            entity.Property(e => e.BudgetType)
                .HasColumnType("character varying")
                .HasColumnName("budgetType");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.IsOngoing).HasColumnName("isOngoing");
            entity.Property(e => e.Month).HasColumnName("month");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.UserId).HasColumnName("userId");
            entity.Property(e => e.Year).HasColumnName("year");

            entity.HasOne(d => d.User).WithMany(p => p.Budgets)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Budgets_userId_fkey");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Categories_pkey");

            entity.HasIndex(e => new { e.UserId, e.Name }, "categories_userid_name_unique").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BudgetId).HasColumnName("budgetId");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.ParentCategoryId).HasColumnName("parentCategoryId");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.Budget).WithMany(p => p.Categories)
                .HasForeignKey(d => d.BudgetId)
                .HasConstraintName("Categories_budgetId_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Categories)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Categories_userId_fkey");
        });

        modelBuilder.Entity<Chore>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Chores_pkey");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AllowanceAmount).HasColumnName("allowance_amount");
            entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.CurrentCount).HasColumnName("current_count");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.MaxCount).HasColumnName("max_count");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Chores)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("Chores_user_id_fkey");
        });

        modelBuilder.Entity<GoodDeed>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("GoodDeeds_pkey");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.CurrentCount).HasColumnName("current_count");
            entity.Property(e => e.MaxCount).HasColumnName("max_count");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.GoodDeeds)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("GoodDeeds_user_id_fkey");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Transactions_pkey");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Amount).HasColumnName("amount");
            entity.Property(e => e.CategoryId).HasColumnName("categoryId");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Date).HasColumnName("transactionDate");
            entity.Property(e => e.UserId).HasColumnName("userId");

            entity.HasOne(d => d.Category).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("Transactions_categoryId_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("Transactions_userId_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Users_pkey");

            entity.HasIndex(e => e.Email, "Users_email_key").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.GoogleId).HasColumnName("googleId");
            entity.Property(e => e.PasswordHash).HasColumnName("passwordHash");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
