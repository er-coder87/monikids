using System;
using System.Collections.Generic;

namespace ExpenseTrackerApi.Models;

public partial class Category
{
    public long Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? Name { get; set; }

    public long UserId { get; set; }

    public long? ParentCategoryId { get; set; }

    public long? BudgetId { get; set; }

    public virtual Budget? Budget { get; set; }

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public virtual User User { get; set; } = null!;
}
