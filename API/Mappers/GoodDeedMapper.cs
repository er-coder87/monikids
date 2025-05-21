using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Models;

namespace ExpenseTrackerApi.Mappers;

public static class GoodDeedMapper
{
    public static GoodDeedDto ToDto(this GoodDeed goodDeed)
    {
        return new GoodDeedDto
        {
            Id = goodDeed.Id,
            MaxCount = goodDeed.MaxCount,
            CurrentCount = goodDeed.CurrentCount
        };
    }

    public static IEnumerable<GoodDeedDto> ToDtoList(this IEnumerable<GoodDeed> goodDeeds)
    {
        return goodDeeds?.Select(ToDto) ?? [];
    }

    public static GoodDeed ToEntity(this UpdateGoodDeedRequest request, long userId)
    {
        return new GoodDeed
        {
            UserId = userId,
            MaxCount = request.MaxCount,
            CurrentCount = request.CurrentCount,
            CreatedAt = DateTime.UtcNow
        };
    }

}
