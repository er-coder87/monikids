
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
            PaidAtDateTime = chore.PaidAt,
            DoneDateTime = chore.DoneAt,
            CreatedDateTime = chore.CreatedAt,
            IsDeleted = chore.IsDeleted
        };
    }

    public static IEnumerable<ChoreDto> ToDtoList(this IEnumerable<Chore> chores)
    {
        return chores?.Select(ToDto) ?? [];
    }

    public static Chore ToEntity(this CreateChoreRequestDto request)
    {
        return new Chore
        {
            Description = request.Description,
            AllowanceAmount = request.AllowanceAmount,
            MaxCount = request.MaxCount,
            CurrentCount = 0,
            CreatedAt = DateTime.UtcNow
        };
    }
    
    public static Chore ToEntity(this UpdateChoreRequestDto request, long choreId)
    {
        return new Chore
        {
            Id = choreId,
            Description = request.Description,
            AllowanceAmount = request.AllowanceAmount,
            MaxCount = request.MaxCount,
            CurrentCount = request.CurrentCount,
            PaidAt = request.PaidAtDateTime,
            DoneAt = request.DoneDateTime,
            IsDeleted = request.IsDeleted
        };
    }
}