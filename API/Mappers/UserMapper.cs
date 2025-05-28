using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Models;

public static class UserMapper
{
    public static UserDto ToDto(this User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
        };
    }
}