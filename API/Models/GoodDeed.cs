using System;
using System.Collections.Generic;

namespace ExpenseTrackerApi.Models;

public partial class GoodDeed
{
    public long Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public long? MaxCount { get; set; }

    public long? CurrentCount { get; set; }

    public long UserId { get; set; }

    public virtual User User { get; set; } = null!;
}
