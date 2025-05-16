namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class CreateTransactionRequest
{
    public DateTime TransactionDate { get; set; }
    public string Description { get; set; }
    public decimal Amount { get; set; }
}