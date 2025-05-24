namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class UpdateChoreRequestDto
{
    public string? Description { get; set; }
    public int MaxCount { get; set; }
    public int CurrentCount { get; set; }
    public decimal AllowanceAmount { get; set; }
    public DateTime? PaidAtDateTime { get; set; }
    public DateTime? DoneDateTime { get; set; }
}