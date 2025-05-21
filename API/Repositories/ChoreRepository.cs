using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface IChoreRepository
{
    Task<IEnumerable<Chore>> GetChoresAsync(long userId);
    Task<Chore?> GetChoreByIdAsync(long userId, long choreId);
    Task<Chore> CreateChoreAsync(Chore chore);
    Task<Chore?> UpdateChoreAsync(long userId, Chore chore);
}


public class ChoreRepository(PostgresContext context, ILogger<ChoreRepository> logger) : IChoreRepository
{
    public async Task<IEnumerable<Chore>> GetChoresAsync(long userId)
    {
        return await context.Chores
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<Chore?> GetChoreByIdAsync(long userId, long choreId)
    {
        return await context.Chores
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == choreId);
    }

    public async Task<Chore> CreateChoreAsync(Chore chore)
    {
        context.Chores.Add(chore);
        await context.SaveChangesAsync();
        return chore;
    }

    public async Task<Chore?> UpdateChoreAsync(long userId, Chore chore)
    {
        var existingChore = await context.Chores
            .FirstOrDefaultAsync(c => c.UserId == userId && c.Id == chore.Id);

        if (existingChore == null)
        {
            return null;
        }

        // Update the properties
        existingChore.Description = chore.Description;
        existingChore.AllowanceAmount = chore.AllowanceAmount;
        existingChore.MaxCount = chore.MaxCount;
        existingChore.CurrentCount = chore.CurrentCount;
        existingChore.CompletedAt = chore.CompletedAt;

        try
        {
            await context.SaveChangesAsync();
            return existingChore;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating chore {ChoreId} for user {UserId}", chore.Id, userId);
            throw;
        }
    }
}
