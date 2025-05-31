using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface IUserRepository
{
    Task<User?> FindByExternalId(string externalUserId);
    Task<User> Create(User user);
    Task<User?> UpdateUserWithCheckSession(string externalUserId, string stripeCustomerId);
}

public class UserRepository(PostgresContext dbContext, ILogger<UserRepository> logger) : IUserRepository
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

    public async Task<User?> UpdateUserWithCheckSession(string externalUserId, string stripeCustomerId)
    {
        var existingUser = await dbContext.Users
            .FirstOrDefaultAsync(u => u.ExternalId == externalUserId);
        
        if (existingUser == null)
        {
            logger.LogWarning("User with external ID {ExternalId} not found", externalUserId);
            return null;
        }
        
        existingUser.StripeCustomerId = stripeCustomerId;

        try
        {
            await dbContext.SaveChangesAsync();
            return existingUser;
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error updating StripeCustomerId for user {ExternalId}", externalUserId);
            
            throw;
        }
        
    }
}
