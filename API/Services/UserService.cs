using ExpenseTrackerApi.Models;
using ExpenseTrackerApi.Repositories;

namespace ExpenseTrackerApi.Services;

public interface IUserService
{
    Task<User?> FindByGoogleIdAsync(string googleId);
    Task<User?> FindByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task<User?> GetByIdAsync(int id); // Optional
}

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User?> FindByGoogleIdAsync(string googleId)
    {
        return await _userRepository.FindByGoogleIdAsync(googleId);
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        return await _userRepository.FindByEmailAsync(email);
    }

    public async Task<User> CreateAsync(User user)
    {
        var createdUser = await _userRepository.CreateAsync(user);
        return createdUser;
    }

    public async Task UpdateAsync(User user)
    {
        await _userRepository.UpdateAsync(user);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _userRepository.GetByIdAsync(id);
    }
}