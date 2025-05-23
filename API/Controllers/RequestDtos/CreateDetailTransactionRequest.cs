namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class CreateTransactionRequest
{
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public decimal? Amount { get; set; }
    public string? Type { get; set; }
}