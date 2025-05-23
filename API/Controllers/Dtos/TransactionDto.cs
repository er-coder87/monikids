namespace ExpenseTrackerApi.Controllers.Dtos;

public class TransactionDto
{
    public long Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public long? UserId { get; set; }

    public DateTime? TransactionDate { get; set; }

    public decimal? Amount { get; set; }

    public long? CategoryId { get; set; }

    public string? Description { get; set; }

    public virtual CategoryDto? Category { get; set; }
    public string? Type { get; set; }
}