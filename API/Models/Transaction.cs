using System;
using System.Collections.Generic;

namespace ExpenseTrackerApi.Models;

public partial class Transaction
{
    public long Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public long? UserId { get; set; }

    public DateTime? TransactionDate { get; set; }

    public decimal? Amount { get; set; }

    public long? CategoryId { get; set; }

    public string? Description { get; set; }

    public string? Type { get; set; }

    public virtual Category? Category { get; set; }

    public virtual User? User { get; set; }
}
