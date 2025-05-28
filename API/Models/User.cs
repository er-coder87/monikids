using System;
using System.Collections.Generic;

namespace ExpenseTrackerApi.Models;

public partial class User
{
    public long Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? Email { get; set; }

    public string? ExternalId { get; set; }

    public string? PasswordHash { get; set; }

    public virtual ICollection<Budget> Budgets { get; set; } = new List<Budget>();

    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    public virtual ICollection<Chore> Chores { get; set; } = new List<Chore>();

    public virtual ICollection<GoodDeed> GoodDeeds { get; set; } = new List<GoodDeed>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
