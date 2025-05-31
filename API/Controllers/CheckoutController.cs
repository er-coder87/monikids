using System.Security.Claims;
using ExpenseTrackerApi.Controllers.RequestDtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

namespace ExpenseTrackerApi.Controllers;

[ApiController]
[Route("api/checkout")]
[Authorize]
public class CheckoutController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public CheckoutController(IConfiguration configuration)
    {
        _configuration = configuration;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    [HttpPost()]
    public async Task<ActionResult> CreateCheckoutSession([FromBody] CreateCheckoutSessionRequestDto request)
    {
        var externalUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(externalUserId))
        {
            return Unauthorized();
        }

        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string>
            {
                "card",
            },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    Price = request.PriceId,
                    Quantity = 1,
                },
            },
            Mode = "subscription",
            SuccessUrl = _configuration["Stripe:SuccessUrl"] + "?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = _configuration["Stripe:CancelUrl"],
            ClientReferenceId = externalUserId, // Associate the session with your user ID
        };

        try
        {
            var service = new SessionService();
            Session session = await service.CreateAsync(options);

            return Ok(new { sessionId = session.Id });
        }
        catch (StripeException e)
        {
            return BadRequest(new { error = new { message = e.StripeError?.Message ?? e.Message } });
        }
        catch (Exception e)
        {
            return StatusCode(500, new { error = new { message = "An unexpected error occurred." } });
        }
    }
}
