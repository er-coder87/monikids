using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Mappers;
using ExpenseTrackerApi.Repositories;

namespace ExpenseTrackerApi.Services;

public interface IChoreService
{
    Task<IEnumerable<ChoreDto>> GetChoresAsync(long userId);
    Task<ChoreDto?> GetChoreByIdAsync(long userId, long choreId);
    Task<ChoreDto> CreateChoreAsync(long userId, CreateChoreRequestDto request);
    Task<ChoreDto?> UpdateChoreAsync(long userId, long choreId, UpdateChoreRequestDto request);
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

    public async Task<IEnumerable<ChoreDto>> GetChoresAsync(long userId)
    {
        try
        {
            var chores = await _choreRepository.GetChoresAsync(userId);
            return chores.ToDtoList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting chores for user {UserId}", userId);
            throw;
        }
    }

    public async Task<ChoreDto?> GetChoreByIdAsync(long userId, long choreId)
    {
        try
        {
            var chore = await _choreRepository.GetChoreByIdAsync(userId, choreId);
            return chore?.ToDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting chore {ChoreId} for user {UserId}", choreId, userId);
            throw;
        }
    }

    public async Task<ChoreDto> CreateChoreAsync(long userId, CreateChoreRequestDto request)
    {
        try
        {
            var chore = request.ToEntity(userId);
            var createdChore = await _choreRepository.CreateChoreAsync(chore);
            return createdChore.ToDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating chore for user {UserId}", userId);
            throw;
        }
    }

    public async Task<ChoreDto?> UpdateChoreAsync(long userId, long choreId, UpdateChoreRequestDto request)
    {
        try
        {
            var chore = request.ToEntity(choreId);
            var updatedChore = await _choreRepository.UpdateChoreAsync(userId, chore);
            return updatedChore?.ToDto();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating chore {ChoreId} for user {UserId}", choreId, userId);
            throw;
        }
    }
}

