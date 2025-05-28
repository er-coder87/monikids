namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class CreateUserRequestDto
{
    public string Sub { get; set; } = "";
    public string Email { get; set; } = "";
    public string Name { get; set; } = "";
}