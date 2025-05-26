using System.Security.Claims;
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
            var externalUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (externalUserId == null)
            {
                return Unauthorized();
            }
            
            var goodDeeds = await goodDeedService.GetGoodDeedsAsync(externalUserId);
            return Ok(new { GoodDeeds = goodDeeds.FirstOrDefault() });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving good deeds");
            return StatusCode(500, "An error occurred while retrieving good deeds");
        }
    }

    [HttpPut()]
    public async Task<ActionResult<GoodDeedDto>> UpdateGoodDeed([FromBody] UpdateGoodDeedRequest request)
    {
        try
        {
            var externalUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (externalUserId == null)
            {
                return Unauthorized();
            }
            
            var goodDeed = await goodDeedService.UpdateGoodDeedAsync(externalUserId, request);
            
            if (goodDeed == null)
            {
                return NotFound(new { Message = "Good deed not found" });
            }

            return Ok(new { GoodDeeds = goodDeed});
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, "An error occurred while updating the good deed");
        }
    }

}