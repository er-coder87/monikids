using ExpenseTrackerApi.Services;
using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;

namespace ExpenseTrackerApi.Controllers;

[ApiController]
[Route("api/stripe-webhook")]
public class StripeWebhookController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IUserService _userService;

    public StripeWebhookController(IConfiguration configuration, IUserService userService)
    {
        _configuration = configuration;
        _userService = userService;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
    }

    [HttpPost]
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var stripeSignatureHeader = Request.Headers["Stripe-Signature"];
        string webhookSecret = _configuration["Stripe:WebhookSecret"];

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                stripeSignatureHeader,
                webhookSecret
            );

            switch (stripeEvent.Type)
            {
                case "checkout.session.completed":
                    var session = (Session)stripeEvent.Data.Object;
                    await HandleCheckoutSessionCompleted(session);
                    break;
                case "customer.subscription.created":
                    var subscription = (Subscription)stripeEvent.Data.Object;
                    await HandleCustomerSubscriptionCreated(subscription);
                    break;
                // case Events.CustomerSubscriptionUpdated:
                //     var updatedSubscription = (Subscription)stripeEvent.Data.Object;
                //     await HandleCustomerSubscriptionUpdated(updatedSubscription);
                //     break;
                // case Events.CustomerSubscriptionDeleted:
                //     var deletedSubscription = (Subscription)stripeEvent.Data.Object;
                //     await HandleCustomerSubscriptionDeleted(deletedSubscription);
                //     break;
                // Add other event types you want to handle
                default:
                    Console.WriteLine($"Unhandled event type: {stripeEvent.Type}");
                    break;
            }

            return Ok();
        }
        catch (StripeException e)
        {
            Console.WriteLine($"Webhook error: {e.Message}");
            return BadRequest(e.Message);
        }
        catch (Exception e)
        {
            Console.WriteLine($"Unexpected webhook error: {e.Message}");
            return StatusCode(500, e.Message);
        }
    }

    private async Task HandleCheckoutSessionCompleted(Session session)
    {
        Console.WriteLine($"Checkout Session Completed: {session.Id}");
        // Get the customer ID: session.CustomerId
        // Get the subscription ID (if applicable): session.SubscriptionId
        // Get the client reference ID (your user ID): session.ClientReferenceId

        if (session.ClientReferenceId != null && session.SubscriptionId != null)
        {
            // TODO: Update your database to associate the Stripe customer and subscription
            // with your user identified by session.ClientReferenceId.
            Console.WriteLine($"User ID: {session.ClientReferenceId}, Stripe Customer ID: {session.CustomerId}, Subscription ID: {session.SubscriptionId}");
            await _userService.UpdateUserWithCheckSession(session.ClientReferenceId, session.CustomerId, session.SubscriptionId);
        }
        else
        {
            Console.WriteLine($"Checkout Session Completed - Missing ClientReferenceId or SubscriptionId: {session.Id}");
        }
    }

    private async Task HandleCustomerSubscriptionCreated(Subscription subscription)
    {
        Console.WriteLine($"Subscription Created: {subscription.Id}, Customer: {subscription.CustomerId}, Status: {subscription.Status}");
        // TODO: You might want to update your database with the subscription details
    }

    private async Task HandleCustomerSubscriptionUpdated(Subscription subscription)
    {
        Console.WriteLine($"Subscription Updated: {subscription.Id}, Customer: {subscription.CustomerId}, Status: {subscription.Status}");
        // TODO: Update your database with the updated subscription details (e.g., plan change)
    }

    private async Task HandleCustomerSubscriptionDeleted(Subscription subscription)
    {
        Console.WriteLine($"Subscription Deleted: {subscription.Id}, Customer: {subscription.CustomerId}");
        // TODO: Update your database to reflect the cancellation
    }
}