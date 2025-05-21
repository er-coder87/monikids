
using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Extensions;
using ExpenseTrackerApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTrackerApi.Controllers;

[Authorize]
[ApiController]
[Route("api/chores")]
public class ChoresController(IChoreService choreService, ILogger<ChoresController> logger)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ChoreDto>>> GetChores()
    {
        try
        {
            var userId = User.GetUserId();
            var chores = await choreService.GetChoresAsync(userId);
            return Ok(new { Message = "Chores retrieved successfully", Chores = chores });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving chores");
            return StatusCode(500, "An error occurred while retrieving chores");
        }
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ChoreDto>> GetChore(long id)
    {
        try
        {
            var userId = User.GetUserId();
            var chore = await choreService.GetChoreByIdAsync(userId, id);
            
            if (chore == null)
            {
                return NotFound(new { Message = "Chore not found" });
            }

            return Ok(chore);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving chore {ChoreId}", id);
            return StatusCode(500, "An error occurred while retrieving the chore");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ChoreDto>> CreateChore([FromBody] CreateChoreRequestDto request)
    {
        try
        {
            var userId = User.GetUserId();
            var chore = await choreService.CreateChoreAsync(userId, request);
            return CreatedAtAction(nameof(GetChore), new { id = chore.Id }, chore);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating chore");
            return StatusCode(500, "An error occurred while creating the chore");
        }
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ChoreDto>> UpdateChore(long id, [FromBody] UpdateChoreRequestDto request)
    {
        try
        {
            var userId = User.GetUserId();
            var chore = await choreService.UpdateChoreAsync(userId, id, request);
            
            if (chore == null)
            {
                return NotFound(new { Message = "Chore not found" });
            }

            return Ok(chore);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating chore {ChoreId}", id);
            return StatusCode(500, "An error occurred while updating the chore");
        }
    }
}