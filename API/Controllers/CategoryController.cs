using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Extensions;
using ExpenseTrackerApi.Models;
using ExpenseTrackerApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTrackerApi.Controllers;

[Authorize]
[ApiController]
[Route("api/categories")]
public class CategoriesController(ILogger<CategoriesController> logger, ICategoryService categoryService)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var userId = User.GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        try
        {
            var categories = await categoryService.GetCategoriesByUserIdAsync(userId);
            return Ok(categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                BudgetId = c.BudgetId,
                ParentCategoryId = c.ParentCategoryId
            }));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving categories for user {UserId}", userId);
            return StatusCode(500, "Failed to retrieve categories.");
        }
    }

    [HttpPost]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> UpsertCategories([FromBody] IEnumerable<CreateCategoryRequestDto> request)
    {
        var userId = User.GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        if (request == null || !request.Any())
        {
            return BadRequest("No categories provided in the request.");
        }

        try
        {
            var categoryEntities = request.Select(r => new Category
            {
                UserId = userId,
                Name = r.Name,
                BudgetId = r.BudgetId,
                ParentCategoryId = r.ParentCategoryId
            }).ToList();

            var createdCategories = await categoryService.UpsertCategoriesAsync(userId, categoryEntities);

            return Ok(createdCategories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
            }));
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error upserting categories for user {UserId}", userId);
            return StatusCode(500, "Failed to upsert categories.");
        }
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteCategory(long id)
    {
        var userId = User.GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        try
        {
            var deleted = await categoryService.DeleteCategoryAsync(userId, id);
            if (deleted)
            {
                return NoContent();
            }
            else
            {
                return NotFound($"Category with ID {id} not found for this user.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting category {Id} for user {UserId}", id, userId);
            return StatusCode(500, "Failed to delete category.");
        }
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(long id, [FromBody] UpdateCategoryRequestDto request)
    {
        var userId = User.GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        if (request == null)
        {
            return BadRequest("Category data is missing in the request body.");
        }

        try
        {
            var updatedCategory = new Category
            {
                Id = id, 
                UserId = userId,
                Name = request.Name,
                BudgetId = request.BudgetId,
                ParentCategoryId = request.ParentCategoryId,
            };
            
            var existingCategory = await categoryService.GetCategoryByIdAsync(userId, id);
            if (existingCategory == null)
            {
                return NotFound($"Category with ID {id} not found for this user.");
            }

            existingCategory.Name = updatedCategory.Name ?? existingCategory.Name;

            var updatedEntity = await categoryService.UpdateCategoryAsync(userId, existingCategory);

            if (updatedEntity == null)
            {
                return StatusCode(500, "Failed to update category.");
            }

            return Ok(new CategoryDto
            {
                Id = updatedEntity.Id,
                Name = updatedEntity.Name,
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating category {Id} for user {UserId}", id, userId);
            return StatusCode(500, "Failed to update category.");
        }
    }
}