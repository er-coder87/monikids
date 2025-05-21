
using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Models;

namespace ExpenseTrackerApi.Mappers;

public static class ChoreMapper
{
    public static ChoreDto ToDto(this Chore chore)
    {
        return new ChoreDto
        {
            Id = chore.Id,
            Description = chore.Description,
            AllowanceAmount = chore.AllowanceAmount,
            MaxCount = (int?)chore.MaxCount,
            CurrentCount = (int?)chore.CurrentCount,
            CompleteDateTime = chore.CompletedAt
        };
    }

    public static IEnumerable<ChoreDto> ToDtoList(this IEnumerable<Chore> chores)
    {
        return chores?.Select(ToDto) ?? [];
    }

    public static Chore ToEntity(this CreateChoreRequestDto request, long userId)
    {
        return new Chore
        {
            UserId = userId,
            Description = request.Description,
            AllowanceAmount = request.AllowanceAmount,
            MaxCount = request.MaxCount,
            CurrentCount = 0,
            CreatedAt = DateTime.UtcNow
        };
    }
    
    public static Chore ToEntity(this UpdateChoreRequestDto request, long userId)
    {
        return new Chore
        {
            UserId = userId,
            Description = request.Description,
            AllowanceAmount = request.AllowanceAmount,
            MaxCount = request.MaxCount,
            CurrentCount = 0,
            CreatedAt = DateTime.UtcNow
        };
    }
}