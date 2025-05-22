using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface IGoodDeedRepository
{
    Task<IEnumerable<GoodDeed>> GetGoodDeedsAsync(long userId);
    Task<GoodDeed?> GetGoodDeedByIdAsync(long userId);
    Task<GoodDeed?> UpdateGoodDeedAsync(long userId, GoodDeed goodDeed);
}

public class GoodDeedRepository(PostgresContext context, ILogger<GoodDeedRepository> logger)
    : IGoodDeedRepository
{
    public async Task<IEnumerable<GoodDeed>> GetGoodDeedsAsync(long userId)
    {
        try
        {
            return await context.GoodDeeds
                .Where(g => g.UserId == userId)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving good deeds for user {UserId}", userId);
            throw;
        }
    }

    public async Task<GoodDeed?> GetGoodDeedByIdAsync(long userId)
    {
        try
        {
            return await context.GoodDeeds
                .FirstOrDefaultAsync(g => g.UserId == userId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving good deed for user {UserId}", userId);
            throw;
        }
    }

    public async Task<GoodDeed?> UpdateGoodDeedAsync(long userId, GoodDeed goodDeed)
    {
        try
        {
            var existingDeed = await context.GoodDeeds
                .FirstOrDefaultAsync(g => g.UserId == userId && g.Id == goodDeed.Id);

            if (existingDeed == null)
            {
                logger.LogWarning("Good deed {Id} not found for user {UserId}", goodDeed.Id, userId);
                return null;
            }

            // Update only allowed fields
            existingDeed.MaxCount = goodDeed.MaxCount;
            existingDeed.CurrentCount = goodDeed.CurrentCount;

            await context.SaveChangesAsync();

            return existingDeed;
        }
        catch (DbUpdateConcurrencyException ex)
        {
            logger.LogError(ex, "Concurrency error updating good deed {Id} for user {UserId}", goodDeed.Id, userId);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating good deed {Id} for user {UserId}", goodDeed.Id, userId);
            throw;
        }
    }
}
