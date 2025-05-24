
namespace ExpenseTrackerApi.Controllers.Dtos;

public class ChoreDto
{
    public long Id { get; set; }
    public string? Description { get; set; }
    public int? MaxCount { get; set; }
    public int? CurrentCount { get; set; }
    public decimal? AllowanceAmount { get; set; }
    public DateTime? PaidAtDateTime { get; set; }
    public DateTime? DoneDateTime { get; set; }
    public DateTime CreatedDateTime { get; set; }
}