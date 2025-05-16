namespace ExpenseTrackerApi.Controllers.Dtos;

public class CategoryDto
{
    public long Id { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? Name { get; set; }
    
    public long? BudgetId { get; set; }
    
    public long? ParentCategoryId { get; set; } 
}