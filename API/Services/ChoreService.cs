using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Mappers;
using ExpenseTrackerApi.Repositories;

namespace ExpenseTrackerApi.Services;

public interface IChoreService
{
    Task<IEnumerable<ChoreDto>> GetChoresAsync(string externalUserId);
    Task<ChoreDto?> GetChoreByIdAsync(string externalUserId, long choreId);
    Task<ChoreDto> CreateChoreAsync(string externalUserId, CreateChoreRequestDto request);
    Task<ChoreDto?> UpdateChoreAsync(string externalUserId, long choreId, UpdateChoreRequestDto request);
}

public class ChoreService : IChoreService
{
    private readonly IChoreRepository _choreRepository;
    private readonly ILogger<ChoreService> _logger;

    public ChoreService(IChoreRepository choreRepository, ILogger<ChoreService> logger)
    {
        _choreRepository = choreRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<ChoreDto>> GetChoresAsync(string externalUserId)
    {
        try
        {
            var chores = await _choreRepository.GetChoresAsync(externalUserId);
            return chores.ToDtoList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting chores for user {ExternalId}", externalUserId);
            throw;
        }
    }

    public async Task<ChoreDto?> GetChoreByIdAsync(string externalUserId, long choreId)
    {
        try
        {
            var chore = await _choreRepository.GetChoreByIdAsync(externalUserId, choreId);
            return chore?.ToDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting chore {ChoreId} for user {ExternalId}", choreId, externalUserId);
            throw;
        }
    }

    public async Task<ChoreDto> CreateChoreAsync(string externalUserId, CreateChoreRequestDto request)
    {
        try
        {
            var chore = request.ToEntity();
            var createdChore = await _choreRepository.CreateChoreAsync(externalUserId, chore);
            return createdChore.ToDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating chore for user {ExternalId}", externalUserId);
            throw;
        }
    }

    public async Task<ChoreDto?> UpdateChoreAsync(string externalUserId, long choreId, UpdateChoreRequestDto request)
    {
        try
        {
            var chore = request.ToEntity(choreId);
            var updatedChore = await _choreRepository.UpdateChoreAsync(externalUserId, chore);
            return updatedChore?.ToDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating chore {ChoreId} for user {ExternalId}", choreId, externalUserId);
            throw;
        }
    }
}