using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface IUserRepository
{
    Task<User?> FindByGoogleIdAsync(string googleId);
    Task<User?> FindByEmailAsync(string email);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<User?> GetByIdAsync(int id); // Optional: if you need to fetch by ID
}

public class UserRepository(PostgresContext context) : IUserRepository
{

    public Task<User?> FindByGoogleIdAsync(string googleId)
    {
        return context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
    }

    public Task<User?> FindByEmailAsync(string email)
    {
        return context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> CreateAsync(User user)
    {
        var createdUser = await context.Users.AddAsync(user);
        await context.SaveChangesAsync();
        
        return createdUser.Entity;
    }

    public async Task<User> UpdateAsync(User user)
    {
        var updatedUser = context.Users.Update(user);
        await context.SaveChangesAsync();
        
        return updatedUser.Entity;
    }

    public Task<User?> GetByIdAsync(int id)
    {
        return context.Users.FindAsync(id).AsTask();
    }
}