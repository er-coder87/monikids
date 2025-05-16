using System.Security.Claims;
using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Extensions;
using ExpenseTrackerApi.Mappers;
using ExpenseTrackerApi.Models;
using ExpenseTrackerApi.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTrackerApi.Controllers;

[Authorize]
[ApiController]
[Route("api/transactions")]
public class TransactionsController(ILogger<TransactionsController> logger, ITransactionRepository transactionRepository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions([FromQuery] TransactionFilter? filter)
    {
        try
        {
            var userId = User.GetUserId();
            var transactions = await transactionRepository.GetTransactionsAsync(userId, filter);
            var transactionDtos = TransactionMapper.ToDtoList(transactions);
            return Ok(new { Message = "Transactions retrieved successfully", Transactions = transactionDtos});
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving the transactions");
            return StatusCode(500, "An error occurred while retrieving the transactions");
        }
    }
    
    [HttpGet("{id:long}")]
    public async Task<ActionResult<Transaction>> GetTransactionById(long id)
    {
        try
        {
            var userId = User.GetUserId();
            var transaction = await transactionRepository.GetTransactionByIdAsync(userId, id);
            if (transaction == null)
            {
                return NotFound();
            }
            var transactionDto = TransactionMapper.ToDto(transaction);
            return Ok(transactionDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving the transaction");
            return StatusCode(500, "An error occurred while retrieving the transaction");
        }
    }

    [HttpPost]
    public async Task<ActionResult<IEnumerable<TransactionDto>>> UpsertTransactions([FromBody] IEnumerable<CreateTransactionRequest> request)
    {
        try
        {
            var userId = User.GetUserId();
            var transactions = request.Select(a => new Transaction
            {
                UserId = userId,
                TransactionDate = DateOnly.FromDateTime(a.TransactionDate),
                Description = a.Description,
                Amount = a.Amount,
            }).ToList();
            
            var updatedTransactions = await transactionRepository.UpsertTransactionsAsync(userId, transactions);
            var transactionDtos = TransactionMapper.ToDtoList(updatedTransactions);
            return Ok(transactionDtos);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating the transaction");
            return StatusCode(500, "An error occurred while updating the transaction");
        }
    }
    
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteTransaction(long id)
    {
        try
        {
            var userId = User.GetUserId();
            await transactionRepository.DeleteTransactionAsync(userId, id);
            return NoContent(); // 204 No Content for successful deletion
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting the transaction");
            return StatusCode(500, "An error occurred while deleting the transaction");
        }

    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(long id, [FromBody] Transaction updatedTransaction)
    {
        try
        {
            var userId = User.GetUserId();
            if (id != updatedTransaction.Id)
            {
                return BadRequest("Transaction ID mismatch");
            }

            var result = await transactionRepository.UpdateTransactionAsync(userId, updatedTransaction);
            if (result == null)
            {
                return NotFound();
            }
            var transactionDto = TransactionMapper.ToDto(result);
            return Ok(transactionDto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating the transaction");
            return StatusCode(500, "An error occurred while updating the transaction");
        }
    }
}