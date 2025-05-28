using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Models;
using ExpenseTrackerApi.Repositories;

namespace ExpenseTrackerApi.Services;

public interface IUserService
{
    Task<UserDto?> FindUserByExternalId(string externalUserId);
    Task<UserDto> CreateUser(string externalUserId, CreateUserRequestDto dto);
}

public class UserService(IUserRepository userRepository, IGoodDeedRepository goodDeedRepository) : IUserService
{
    public async Task<UserDto?> FindUserByExternalId(string externalUserId)
    {
        var user = await userRepository.FindByExternalId(externalUserId);
        
        return user?.ToDto();
    }

    public async Task<UserDto> CreateUser(string externalUserId, CreateUserRequestDto dto)
    {
        var user = new User
        {
            Email = dto.Email,
            ExternalId = externalUserId,
            CreatedAt = DateTime.UtcNow,
        };

        await userRepository.Create(user);
        await goodDeedRepository.CreateGoodDeedAsync(user.Id);

        return user.ToDto();
    }
}
