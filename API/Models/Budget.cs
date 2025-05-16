using System;
using System.Collections.Generic;

namespace ExpenseTrackerApi.Models;

public partial class Budget
{
    public long Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public long UserId { get; set; }

    public string? Name { get; set; }

    public string? BudgetType { get; set; }

    public short? Year { get; set; }

    public short? Month { get; set; }

    public decimal? Amount { get; set; }

    public bool? IsOngoing { get; set; }

    public virtual ICollection<Category> Categories { get; set; } = new List<Category>();

    public virtual User User { get; set; } = null!;
}
