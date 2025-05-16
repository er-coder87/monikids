namespace ExpenseTrackerApi.Controllers;

public class TransactionFilter
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    // Add other filter properties as needed, e.g.,
    // public decimal? MinAmount { get; set; }
    // public decimal? MaxAmount { get; set; }
    // public string? Category { get; set; }
}