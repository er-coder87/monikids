using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Models;
using ExpenseTrackerApi.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ExpenseTrackerApi.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IConfiguration configuration, IUserService userService) : ControllerBase
    {
        [HttpPost("validate-token")]
        [Authorize(AuthenticationSchemes = "Bearer")] 
        public IActionResult ValidateToken()
        {
            var user = User.Identity?.Name;
            return Ok(new { 
                user = new { 
                    id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    email = User.FindFirst(ClaimTypes.Email)?.Value,
                    name = User.FindFirst(ClaimTypes.Name)?.Value
                } 
            });
        }
        
        // TODO - block signup until authz is implemented
        // [HttpPost("signup")]
        // public async Task<IActionResult> SignUp([FromBody] SignUpRequest dto)
        // {
        //     var existingUser = await userService.FindByEmailAsync(dto.Email);
        //     if (existingUser != null)
        //     {
        //         return BadRequest("User already exists.");
        //     }
        //
        //     var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password); // or use any hash function
        //     var newUser = new User
        //     {
        //         Email = dto.Email,
        //         PasswordHash = passwordHash
        //     };
        //
        //     var createdUser = await userService.CreateAsync(newUser);
        //
        //     var token = GenerateJwtToken(createdUser);
        //     return Ok(new
        //     {
        //         token, User = new UserDto()
        //         {
        //             Id = createdUser.Id,
        //             Email = createdUser.Email,
        //         }
        //     });
        // }
        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await userService.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return Unauthorized("Invalid email");
            }

            var passwordHasher = new PasswordHasher<User>();
            var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

            if (result != PasswordVerificationResult.Success)
            {
                return Unauthorized("Invalid email or password");
            }

            var token = GenerateJwtToken(user);
            
            Response.Cookies.Append("auth", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,                
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddMinutes(1440),
                Path = "/"
            });
            
            return Ok(new
            {
                token, User = new UserDto()
                {
                    Id = user.Id,
                    Email = user.Email,
                }
            });
        }
        
        [HttpPost("google")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            if (request.AccessToken == null || request.GoogleUser == null)
            {
                return BadRequest(new { message = "Invalid Google login request." });
            }

            // TODO temporary solution until authz is implemented
            if (request.GoogleUser.Email != "ssicose@gmail.com")
            {
                return Unauthorized(new { message = "Invalid email" });
            }

            // Optionally verify the access token with Google here if needed
            var result = await VerifyAccessTokenAsync(request.AccessToken);
            if (result == false)
            {
                return Unauthorized(new { message = "Invalid access" });
            }
            
            // Now, check if a user with this Google ID or email exists in your database
            var user = await userService.FindByEmailAsync(request.GoogleUser.Email);
            if (user == null)
            {
                // Create a new user in your database
                user = new User
                {
                    Email = request.GoogleUser.Email,
                    GoogleId = request.GoogleUser.Sub,
                };
                await userService.CreateAsync(user);
            }
            else
            {
                user.GoogleId = request.GoogleUser.Sub;
                await userService.UpdateAsync(user);
            }
            
            var token = GenerateJwtToken(user);
            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = DateTimeOffset.UtcNow.AddMinutes(1440),
            });
            
            return Ok(new { user = new { id = user.Id, email = user.Email } });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["Secret"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expiryMinutes = int.Parse(jwtSettings["ExpiryMinutes"]);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, "User")
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        private async Task<bool> VerifyAccessTokenAsync(string accessToken)
        {
            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync($"https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={accessToken}");
            return response.IsSuccessStatusCode;
        }
    }

    public class GoogleLoginRequest
    {
        public GoogleUserDto? GoogleUser { get; set; }
        public string? AccessToken { get; set; }
    }

    public class GoogleUserDto
    {
        public string? Sub { get; set; }
        public string? Email { get; set; }
        public bool EmailVerified { get; set; }
        public string? Name { get; set; }
        public string? Picture { get; set; }
        public string? GivenName { get; set; }
        public string? FamilyName { get; set; }
        public string? Locale { get; set; }
    }
}
