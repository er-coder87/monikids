namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class CreateChoreRequestDto
{
    public string? Description { get; set; }
    public int MaxCount { get; set; }
    public int CurrentCount { get; set; }
    public decimal AllowanceAmount { get; set; }
}