using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface IGoodDeedRepository
{
    Task<IEnumerable<GoodDeed>> GetGoodDeedsAsync(string externalUserId);
    Task<GoodDeed?> GetGoodDeedByIdAsync(string externalUserId);
    Task<GoodDeed?> UpdateGoodDeedAsync(string externalUserId, GoodDeed goodDeed);
}

public class GoodDeedRepository(PostgresContext context, ILogger<GoodDeedRepository> logger)
    : IGoodDeedRepository
{
    public async Task<IEnumerable<GoodDeed>> GetGoodDeedsAsync(string externalUserId)
    {
        try
        {
            return await context.GoodDeeds
                .Join(context.Users,
                    deed => deed.UserId,
                    user => user.Id,
                    (deed, user) => new { deed, user })
                .Where(x => x.user.ExternalId == externalUserId)
                .OrderByDescending(x => x.deed.CreatedAt)
                .Select(x => x.deed)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving good deeds for user {ExternalUserId}", externalUserId);
            throw;
        }
    }

    public async Task<GoodDeed?> GetGoodDeedByIdAsync(string externalUserId)
    {
        try
        {
            return await context.GoodDeeds
                .Join(context.Users,
                    deed => deed.UserId,
                    user => user.Id,
                    (deed, user) => new { deed, user })
                .Where(x => x.user.ExternalId == externalUserId)
                .Select(x => x.deed)
                .FirstOrDefaultAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving good deed for user {ExternalUserId}", externalUserId);
            throw;
        }
    }

    public async Task<GoodDeed?> UpdateGoodDeedAsync(string externalUserId, GoodDeed goodDeed)
    {
        try
        {
            var existingDeed = await context.GoodDeeds
                .Join(context.Users,
                    deed => deed.UserId,
                    user => user.Id,
                    (deed, user) => new { deed, user })
                .Where(x => x.user.ExternalId == externalUserId && x.deed.Id == goodDeed.Id)
                .Select(x => x.deed)
                .FirstOrDefaultAsync();

            if (existingDeed == null)
            {
                logger.LogWarning("Good deed {Id} not found for user {ExternalUserId}", goodDeed.Id, externalUserId);
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
            logger.LogError(ex, "Concurrency error updating good deed {Id} for user {ExternalUserId}", 
                goodDeed.Id, externalUserId);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating good deed {Id} for user {ExternalUserId}", 
                goodDeed.Id, externalUserId);
            throw;
        }
    }
}