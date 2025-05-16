namespace ExpenseTrackerApi.Controllers.RequestDtos;

public class SignUpRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}