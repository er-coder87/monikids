namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class UpdateCategoryRequestDto
{
    public string? Name { get; set; }
    public long? BudgetId { get; set; }
    public long? ParentCategoryId { get; set; }
}
