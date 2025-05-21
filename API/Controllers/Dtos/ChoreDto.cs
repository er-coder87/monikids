
namespace ExpenseTrackerApi.Controllers.Dtos;

public class ChoreDto
{
    public long Id { get; set; }
    public string? Description { get; set; }
    public int? MaxCount { get; set; }
    public int? CurrentCount { get; set; }
    public decimal? AllowanceAmount { get; set; }
    public DateOnly? CompleteDateTime { get; set; }
}