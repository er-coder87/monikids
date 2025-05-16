namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class CreateCategoryRequestDto
{
    public string Name { get; set; }
    public long? BudgetId { get; set; }
    public long? ParentCategoryId { get; set; }
}
