using ExpenseTrackerApi.Controllers;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Models;
using ExpenseTrackerApi.Repositories;

namespace ExpenseTrackerApi.Services;

public interface ITransactionService
{
    Task<IEnumerable<Transaction>> GetTransactionsAsync(string externalUserId, TransactionFilter? filter = null);
    Task<Transaction?> GetTransactionByIdAsync(string externalUserId, long id);
    Task<Transaction> AddTransactionAsync(string externalUserId, CreateTransactionRequestDto requestDto);
    Task DeleteTransactionAsync(string externalUserId, long id);
    Task<Transaction?> UpdateTransactionAsync(string externalUserId, long id, UpdateTransactionRequestDto updatedTransaction);
}

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly ILogger<TransactionService> _logger;

    public TransactionService(ITransactionRepository transactionRepository, ILogger<TransactionService> logger)
    {
        _transactionRepository = transactionRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<Transaction>> GetTransactionsAsync(string externalUserId, TransactionFilter? filter = null)
    {
        try
        {
            return await _transactionRepository.GetTransactionsAsync(externalUserId, filter);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transactions for user {ExternalUserId}", externalUserId);
            throw;
        }
    }

    public async Task<Transaction?> GetTransactionByIdAsync(string externalUserId, long id)
    {
        try
        {
            return await _transactionRepository.GetTransactionByIdAsync(externalUserId, id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving transaction {Id} for user {ExternalUserId}", id, externalUserId);
            throw;
        }
    }

    public async Task<Transaction> AddTransactionAsync(string externalUserId, CreateTransactionRequestDto requestDto)
    {
        try
        {
            var transaction = new Transaction
            {
                TransactionDate = requestDto.Date,
                Description = requestDto.Description,
                Type = requestDto.Type,
                Amount = requestDto.Amount,
            };

            return await _transactionRepository.AddTransactionAsync(externalUserId, transaction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating transaction for user {ExternalUserId}", externalUserId);
            throw;
        }
    }

    public async Task DeleteTransactionAsync(string externalUserId, long id)
    {
        try
        {
            await _transactionRepository.DeleteTransactionAsync(externalUserId, id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting transaction {Id} for user {ExternalUserId}", id, externalUserId);
            throw;
        }
    }

    public async Task<Transaction?> UpdateTransactionAsync(string externalUserId, long id, UpdateTransactionRequestDto updatedTransaction)
    {
        try
        {
            var transaction = new Transaction
            {
                Id = id,
                TransactionDate = updatedTransaction.Date,
                Description = updatedTransaction.Description,
                Amount = updatedTransaction.Amount,
            };

            return await _transactionRepository.UpdateTransactionAsync(externalUserId, transaction);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating transaction {Id} for user {ExternalUserId}", id, externalUserId);
            throw;
        }
    }
}