namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class CreateBudgetRequest
{
    public string Name { get; set; }
    public string BudgetType { get; set; }
    public int? Year { get; set; }
    public int? Month { get; set; }
    public decimal Amount { get; set; }
    public bool? IsOngoing { get; set; }
    public List<long> CategoryIds { get; set; } = new List<long>();
}