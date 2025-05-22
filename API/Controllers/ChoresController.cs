
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
            return Ok(chores);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving chores");
            return StatusCode(500, "An error occurred while retrieving chores");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ChoreDto>> CreateChore([FromBody] CreateChoreRequestDto request)
    {
        try
        {
            var userId = User.GetUserId();
            var chore = await choreService.CreateChoreAsync(userId, request);
            return Ok(new { Chores = chore});
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

    // TODO implement I DID IT
    // TODO implement delete
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