using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Mappers;
using ExpenseTrackerApi.Repositories;

namespace ExpenseTrackerApi.Services;

public interface IGoodDeedService
{
    Task<IEnumerable<GoodDeedDto>> GetGoodDeedsAsync(string externalUserId);
    Task<GoodDeedDto?> UpdateGoodDeedAsync(string externalUserId, UpdateGoodDeedRequest request);
}

public class GoodDeedService(IGoodDeedRepository goodDeedRepository, ILogger<GoodDeedService> logger)
    : IGoodDeedService
{
    public async Task<IEnumerable<GoodDeedDto>> GetGoodDeedsAsync(string externalUserId)
    {
        try
        {
            var goodDeeds = await goodDeedRepository.GetGoodDeedsAsync(externalUserId);
            return goodDeeds.ToDtoList();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting good deeds for user {ExternalUserId}", externalUserId);
            throw;
        }
    }

    public async Task<GoodDeedDto?> UpdateGoodDeedAsync(string externalUserId, UpdateGoodDeedRequest request)
    {
        try
        {
            // Get existing good deed
            var goodDeed = await goodDeedRepository.GetGoodDeedByIdAsync(externalUserId);
            if (goodDeed == null)
            {
                return null;
            }
            
            // Update good deed
            goodDeed.CurrentCount = request.CurrentCount;
            goodDeed.MaxCount = request.MaxCount ?? goodDeed.MaxCount;
            
            // Save changes
            var updatedGoodDeed = await goodDeedRepository.UpdateGoodDeedAsync(externalUserId, goodDeed);
            return updatedGoodDeed?.ToDto();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating good deed for user {ExternalUserId}", externalUserId);
            throw;
        }
    }
}