using System.Security.Claims;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTrackerApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UsersController(IUserService userService) : ControllerBase
{

    [HttpPost]
    public async Task<IActionResult> RegisterUser([FromBody] CreateUserRequestDto dto)
    {
        var externalUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(externalUserId))
        {
            return BadRequest("External user ID not found");
        }

        // Find existing user
        var existingUser = await userService.FindUserByExternalId(externalUserId);
        if (existingUser != null)
        {
            return Ok(existingUser);
        }

        var newUser = await userService.CreateUser(externalUserId, dto);
        
        return Ok(newUser);
    }
}