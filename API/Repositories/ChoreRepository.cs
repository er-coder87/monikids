using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface IChoreRepository
{
    Task<IEnumerable<Chore>> GetChoresAsync(string externalUserId);
    Task<Chore?> GetChoreByIdAsync(string externalUserId, long choreId);
    Task<Chore> CreateChoreAsync(string externalUserId, Chore chore);
    Task<Chore?> UpdateChoreAsync(string externalUserId, Chore chore);
}

public class ChoreRepository(PostgresContext context, ILogger<ChoreRepository> logger) : IChoreRepository
{
    public async Task<IEnumerable<Chore>> GetChoresAsync(string externalUserId)
    {
        return await context.Chores
            .Join(context.Users,
                chore => chore.UserId,
                user => user.Id,
                (chore, user) => new { chore, user })
            .Where(x => x.user.ExternalId == externalUserId)
            .OrderByDescending(x => x.chore.CreatedAt)
            .Select(x => x.chore)
            .ToListAsync();
    }

    public async Task<Chore?> GetChoreByIdAsync(string externalUserId, long choreId)
    {
        return await context.Chores
            .Join(context.Users,
                chore => chore.UserId,
                user => user.Id,
                (chore, user) => new { chore, user })
            .Where(x => x.user.ExternalId == externalUserId && x.chore.Id == choreId)
            .Select(x => x.chore)
            .FirstOrDefaultAsync();
    }

    public async Task<Chore> CreateChoreAsync(string externalUserId, Chore chore)
    {
        var userId = await context.Users
            .Where(u => u.ExternalId == externalUserId)
            .Select(u => u.Id)
            .FirstOrDefaultAsync();

        if (userId == 0)
        {
            throw new InvalidOperationException($"User with external ID {externalUserId} not found");
        }

        chore.UserId = userId;
        context.Chores.Add(chore);
        await context.SaveChangesAsync();
        return chore;
    }

    public async Task<Chore?> UpdateChoreAsync(string externalUserId, Chore chore)
    {
        var existingChore = await context.Chores
            .Join(context.Users,
                c => c.UserId,
                user => user.Id,
                (c, user) => new { chore = c, user })
            .Where(x => x.user.ExternalId == externalUserId && x.chore.Id == chore.Id)
            .Select(x => x.chore)
            .FirstOrDefaultAsync();

        if (existingChore == null)
        {
            return null;
        }

        // Update the properties
        existingChore.Description = chore.Description;
        existingChore.AllowanceAmount = chore.AllowanceAmount;
        existingChore.MaxCount = chore.MaxCount;
        existingChore.CurrentCount = chore.CurrentCount;
        existingChore.PaidAt = chore.PaidAt;
        existingChore.DoneAt = chore.DoneAt;
        existingChore.IsDeleted = chore.IsDeleted;

        try
        {
            await context.SaveChangesAsync();
            return existingChore;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating chore {ChoreId} for user {ExternalId}", chore.Id, externalUserId);
            throw;
        }
    }
}