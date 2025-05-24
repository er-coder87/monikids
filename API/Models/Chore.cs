using System;
using System.Collections.Generic;

namespace ExpenseTrackerApi.Models;

public partial class Chore
{
    public long Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? Description { get; set; }

    public long? MaxCount { get; set; }

    public long? CurrentCount { get; set; }

    public decimal? AllowanceAmount { get; set; }

    public long UserId { get; set; }

    public DateTime? PaidAt { get; set; }

    public DateTime? DoneAt { get; set; }

    public virtual User User { get; set; } = null!;
}
