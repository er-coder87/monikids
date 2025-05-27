
using System.Security.Claims;
using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Extensions;
using ExpenseTrackerApi.Mappers;
using ExpenseTrackerApi.Models;
using ExpenseTrackerApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTrackerApi.Controllers;

[Authorize]
[ApiController]
[Route("api/transactions")]
public class TransactionsController(
    ILogger<TransactionsController> logger,
    ITransactionService transactionService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactions([FromQuery] TransactionFilter? filter)
    {
        try
        {
            var externalUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (externalUserId == null)
            {
                return Unauthorized();
            }
            var transactions = await transactionService.GetTransactionsAsync(externalUserId, filter);
            var transactionDtos = TransactionMapper.ToDtoList(transactions);
            return Ok(new { Transactions = transactionDtos});
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
            var externalUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (externalUserId == null)
            {
                return Unauthorized();
            }
            var transaction = await transactionService.GetTransactionByIdAsync(externalUserId, id);
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
    public async Task<ActionResult<TransactionDto>> AddTransaction([FromBody] CreateTransactionRequestDto requestDto)
    {
        try
        {
            var externalUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (externalUserId == null)
            {
                return Unauthorized();
            }
        
            var createdTransaction = await transactionService.AddTransactionAsync(externalUserId, requestDto);
            var transactionDto = TransactionMapper.ToDto(createdTransaction);
        
            return CreatedAtAction(
                nameof(GetTransactionById), 
                new { id = transactionDto.Id }, 
                new { Message = "Transaction created successfully", Transaction = transactionDto }
            );
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating the transaction");
            return StatusCode(500, "An error occurred while creating the transaction");
        }
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> DeleteTransaction(long id)
    {
        try
        {
            var externalUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (externalUserId == null)
            {
                return Unauthorized();
            }
            await transactionService.DeleteTransactionAsync(externalUserId, id);
            return NoContent();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting the transaction");
            return StatusCode(500, "An error occurred while deleting the transaction");
        }
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<TransactionDto>> UpdateTransaction(long id, [FromBody] UpdateTransactionRequestDto updatedTransaction)
    {
        try
        {
            var externalUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (externalUserId == null)
            {
                return Unauthorized();
            }
            if (id != updatedTransaction.Id)
            {
                return BadRequest("Transaction ID mismatch");
            }

            var result = await transactionService.UpdateTransactionAsync(externalUserId, id, updatedTransaction);
            if (result == null)
            {
                return NotFound();
            }
            var transactionDto = TransactionMapper.ToDto(result);
            return Ok(new { Message = "Transaction updated successfully", Transaction = transactionDto });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating the transaction");
            return StatusCode(500, "An error occurred while updating the transaction");
        }
    }
}