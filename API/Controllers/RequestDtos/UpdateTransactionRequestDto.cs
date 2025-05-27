namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class UpdateTransactionRequestDto
{
    public long? Id { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public decimal? Amount { get; set; }
}