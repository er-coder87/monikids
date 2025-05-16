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
[Route("api/budgets")]
public class BudgetController(ILogger<BudgetController> logger, IBudgetService budgetService)
    : ControllerBase
{

    [HttpPost]
    public async Task<ActionResult<BudgetDto>> CreateBudget([FromBody] CreateBudgetRequest request)
    {
        var userId = User.GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        if (request == null)
        {
            return BadRequest("Budget data is missing in the request body.");
        }

        try
        {
            var budget = new Budget
            {
                UserId = userId,
                Name = request.Name,
                BudgetType = request.BudgetType,
                Year = (short?)request.Year,
                Month = (short?)request.Month,
                Amount = request.Amount,
                IsOngoing = request.IsOngoing ?? false,
            };

            var createdBudget = await budgetService.CreateBudgetAsync(budget, request.CategoryIds);

            if (createdBudget == null)
            {
                return StatusCode(500, "Failed to create budget.");
            }

            return CreatedAtAction(nameof(GetBudget), new { id = createdBudget.Id }, new BudgetDto
            {
                BudgetId = createdBudget.Id,
                Name = createdBudget.Name,
                BudgetType = createdBudget.BudgetType,
                Year = createdBudget.Year,
                Month = createdBudget.Month,
                Amount = createdBudget.Amount ?? 0,
                IsOngoing = createdBudget.IsOngoing ?? false,
                CategoryIds = createdBudget.Categories.Select(c => c.Id).ToList()
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating budget for user {UserId}", userId);
            return StatusCode(500, "Failed to create budget.");
        }
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<BudgetDto>> UpdateBudget(long id, [FromBody] UpdateBudgetRequest request)
    {
        var userId = User.GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        if (request == null)
        {
            return BadRequest("Budget update data is missing in the request body.");
        }

        try
        {
            var existingBudget = await budgetService.GetBudgetByIdAsync(userId, id);
            if (existingBudget == null)
            {
                return NotFound($"Budget with ID {id} not found for this user.");
            }

            existingBudget.Name = request.Name ?? existingBudget.Name;
            existingBudget.BudgetType = request.BudgetType ?? existingBudget.BudgetType;
            existingBudget.Year = (short?)request.Year ?? existingBudget.Year;
            existingBudget.Month = (short?)request.Month ?? existingBudget.Month;
            existingBudget.Amount = request.Amount ?? existingBudget.Amount;
            existingBudget.IsOngoing = request.IsOngoing ?? existingBudget.IsOngoing;

            var updatedBudget = await budgetService.UpdateBudgetAsync(existingBudget, request.CategoryIds);

            if (updatedBudget == null)
            {
                return StatusCode(500, "Failed to update budget.");
            }

            return Ok(new BudgetDto
            {
                BudgetId = updatedBudget.Id,
                Name = updatedBudget.Name,
                BudgetType = updatedBudget.BudgetType,
                Year = updatedBudget.Year,
                Month = updatedBudget.Month,
                Amount = updatedBudget.Amount ?? 0,
                IsOngoing = updatedBudget.IsOngoing ?? false,
                CategoryIds = updatedBudget.Categories.Select(c => c.Id).ToList()
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating budget {BudgetId} for user {UserId}", id, userId);
            return StatusCode(500, "Failed to update budget.");
        }
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteBudget(long id)
    {
        var userId = User.GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        try
        {
            var deleted = await budgetService.DeleteBudgetAsync(userId, id);
            if (deleted)
            {
                return NoContent();
            }
            else
            {
                return NotFound($"Budget with ID {id} not found for this user.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting budget {BudgetId} for user {UserId}", id, userId);
            return StatusCode(500, "Failed to delete budget.");
        }
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<BudgetDto>> GetBudget(long id)
    {
        var userId = User.GetUserId();
        if (userId == 0)
        {
            return Unauthorized();
        }

        var budget = await budgetService.GetBudgetByIdAsync(userId, id);

        if (budget == null)
        {
            return NotFound();
        }

        return Ok(new BudgetDto
        {
            BudgetId = budget.Id,
            Name = budget.Name,
            BudgetType = budget.BudgetType,
            Year = budget.Year,
            Month = budget.Month,
            Amount = budget.Amount ?? 0,
            IsOngoing = budget.IsOngoing ?? false,
            CategoryIds = budget.Categories.Select(c => c.Id).ToList()
        });
    }
}
