using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Extensions;
using ExpenseTrackerApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTrackerApi.Controllers;

[Authorize]
[ApiController]
[Route("api/good-deeds")]
public class GoodDeedsController(IGoodDeedService goodDeedService, ILogger<GoodDeedsController> logger)
    : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<GoodDeedDto>> GetGoodDeeds()
    {
        try
        {
            var userId = User.GetUserId();
            var goodDeeds = await goodDeedService.GetGoodDeedsAsync(userId);
            return Ok(new { Message = "Good deeds retrieved successfully", GoodDeeds = goodDeeds });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving good deeds");
            return StatusCode(500, "An error occurred while retrieving good deeds");
        }
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<GoodDeedDto>> UpdateGoodDeed(long id, [FromBody] UpdateGoodDeedRequest request)
    {
        try
        {
            var userId = User.GetUserId();
            var goodDeed = await goodDeedService.UpdateGoodDeedAsync(userId, id, request);
            
            if (goodDeed == null)
            {
                return NotFound(new { Message = "Good deed not found" });
            }

            return Ok(goodDeed);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating good deed {GoodDeedId}", id);
            return StatusCode(500, "An error occurred while updating the good deed");
        }
    }

}