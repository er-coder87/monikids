using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Mappers;
using ExpenseTrackerApi.Repositories;

namespace ExpenseTrackerApi.Services;

public interface IGoodDeedService
{
    Task<IEnumerable<GoodDeedDto>> GetGoodDeedsAsync(long userId);
    Task<GoodDeedDto?> UpdateGoodDeedAsync(long userId, long id, UpdateGoodDeedRequest request);
}

public class GoodDeedService(IGoodDeedRepository goodDeedRepository, ILogger<GoodDeedService> logger)
    : IGoodDeedService
{
    public async Task<IEnumerable<GoodDeedDto>> GetGoodDeedsAsync(long userId)
    {
        try
        {
            var goodDeeds = await goodDeedRepository.GetGoodDeedsAsync(userId);
            return goodDeeds.ToDtoList();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting good deeds for user {UserId}", userId);
            throw;
        }
    }

    public async Task<GoodDeedDto?> UpdateGoodDeedAsync(long userId, long id, UpdateGoodDeedRequest request)
    {
        try
        {
            // Get existing good deed
            var goodDeed = await goodDeedRepository.GetGoodDeedByIdAsync(userId, id);
            if (goodDeed == null)
            {
                return null;
            }
            
            // Update good deed
            goodDeed.CurrentCount = request.CurrentCount;
            goodDeed.MaxCount = request.MaxCount ?? goodDeed.MaxCount;
            
            // Save changes
            var updatedGoodDeed = await goodDeedRepository.UpdateGoodDeedAsync(userId, goodDeed);
            return updatedGoodDeed?.ToDto();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating good deed {GoodDeedId} for user {UserId}", id, userId);
            throw;
        }
    }
}