using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Models;

namespace ExpenseTrackerApi.Mappers;

public static class CategoryMapper
{
    public static CategoryDto ToDto(Category category)
    {
        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name
        };
    }

    public static List<CategoryDto> ToDtoList(IEnumerable<Category> categories)
    {
        return categories.Select(ToDto).ToList();
    }
}