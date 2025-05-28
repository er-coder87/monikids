using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface IUserRepository
{
    Task<User?> FindByExternalId(string externalUserId);
    Task<User> Create(User user);
}

public class UserRepository(PostgresContext dbContext) : IUserRepository
{

    public async Task<User?> FindByExternalId(string externalUserId)
    {
        return await dbContext.Users
            .FirstOrDefaultAsync(u => u.ExternalId == externalUserId);
    }

    public async Task<User> Create(User user)
    {
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync();
        return user;
    }
}
