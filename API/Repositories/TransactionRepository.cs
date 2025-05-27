
using ExpenseTrackerApi.Controllers;
using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface ITransactionRepository
{
    Task<Transaction> AddTransactionAsync(string externalUserId, Transaction transaction);
    Task<IEnumerable<Transaction>> UpsertTransactionsAsync(string externalUserId, IEnumerable<Transaction> transactions);
    Task<IEnumerable<Transaction>> GetTransactionsAsync(string externalUserId, TransactionFilter? filter = null);
    Task<Transaction?> GetTransactionByIdAsync(string externalUserId, long id);
    Task DeleteTransactionAsync(string externalUserId, long id);
    Task<Transaction?> UpdateTransactionAsync(string externalUserId, Transaction updatedTransaction);
}

public class TransactionRepository(PostgresContext context, ILogger<TransactionRepository> logger) : ITransactionRepository
{
    public async Task<Transaction> AddTransactionAsync(string externalUserId, Transaction transaction)
    {
        var userId = await GetUserIdFromExternalId(externalUserId);
        transaction.UserId = userId;
        transaction.CreatedAt = DateTime.UtcNow;
    
        context.Transactions.Add(transaction);
        await context.SaveChangesAsync();
    
        return transaction;
    }

    public async Task<IEnumerable<Transaction>> UpsertTransactionsAsync(string externalUserId,
        IEnumerable<Transaction> transactions)
    {
        var userId = await GetUserIdFromExternalId(externalUserId);
        var incomingTransactions = transactions.ToList();
        var transactionsToInsert = new List<Transaction>();
        var transactionsToUpdate = new List<Transaction>();

        // Fetch all existing transactions for the user
        var existingTransactions = await context.Transactions
            .Join(context.Users,
                t => t.UserId,
                u => u.Id,
                (t, u) => new { Transaction = t, User = u })
            .Where(x => x.User.ExternalId == externalUserId)
            .Select(x => x.Transaction)
            .ToListAsync();

        foreach (var incomingTransaction in incomingTransactions)
        {
            incomingTransaction.UserId = userId;

            var existingTransaction = existingTransactions.FirstOrDefault(et =>
                et.TransactionDate == incomingTransaction.TransactionDate &&
                et.Description == incomingTransaction.Description &&
                et.Amount == incomingTransaction.Amount);

            if (existingTransaction != null)
            {
                existingTransaction.CategoryId = incomingTransaction.CategoryId;
                transactionsToUpdate.Add(existingTransaction);
            }
            else
            {
                transactionsToInsert.Add(incomingTransaction);
            }
        }

        if (transactionsToInsert.Any())
        {
            await context.Transactions.AddRangeAsync(transactionsToInsert);
        }

        if (transactionsToUpdate.Any())
        {
            context.Transactions.UpdateRange(transactionsToUpdate);
        }

        await context.SaveChangesAsync();

        return incomingTransactions;
    }
    
    public async Task<IEnumerable<Transaction>> GetTransactionsAsync(string externalUserId, TransactionFilter? filter = null)
    {
        var query = context.Transactions
            .Join(context.Users,
                t => t.UserId,
                u => u.Id,
                (t, u) => new { Transaction = t, User = u })
            .Where(x => x.User.ExternalId == externalUserId)
            .Select(x => x.Transaction)
            .Include(t => t.Category)
            .AsQueryable();

        if (filter != null)
        {
            if (filter.StartDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate >= filter.StartDate.Value);
            }

            if (filter.EndDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate <= filter.EndDate.Value.Date.AddDays(1));
            }
        }

        return await query.ToListAsync();
    }

    public async Task<Transaction?> GetTransactionByIdAsync(string externalUserId, long id)
    {
        return await context.Transactions
            .Join(context.Users,
                t => t.UserId,
                u => u.Id,
                (t, u) => new { Transaction = t, User = u })
            .Where(x => x.User.ExternalId == externalUserId && x.Transaction.Id == id)
            .Select(x => x.Transaction)
            .Include(t => t.Category)
            .FirstOrDefaultAsync();
    }

    public async Task DeleteTransactionAsync(string externalUserId, long id)
    {
        var transaction = await context.Transactions
            .Join(context.Users,
                t => t.UserId,
                u => u.Id,
                (t, u) => new { Transaction = t, User = u })
            .Where(x => x.User.ExternalId == externalUserId && x.Transaction.Id == id)
            .Select(x => x.Transaction)
            .FirstOrDefaultAsync();

        if (transaction != null)
        {
            context.Transactions.Remove(transaction);
            await context.SaveChangesAsync();
        }
    }

    public async Task<Transaction?> UpdateTransactionAsync(string externalUserId, Transaction updatedTransaction)
    {
        var existingTransaction = await context.Transactions
            .Join(context.Users,
                t => t.UserId,
                u => u.Id,
                (t, u) => new { Transaction = t, User = u })
            .Where(x => x.User.ExternalId == externalUserId && x.Transaction.Id == updatedTransaction.Id)
            .Select(x => x.Transaction)
            .FirstOrDefaultAsync();

        if (existingTransaction == null)
        {
            return null;
        }

        // Update only allowed fields
        existingTransaction.Amount = updatedTransaction.Amount;
        existingTransaction.Description = updatedTransaction.Description;
        existingTransaction.TransactionDate = updatedTransaction.TransactionDate;

        try
        {
            await context.SaveChangesAsync();
            return existingTransaction;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating transaction {TransactionId} for user {ExternalId}", existingTransaction.Id, externalUserId);
            throw;
        }
    }

    private async Task<long> GetUserIdFromExternalId(string externalUserId)
    {
        var userId = await context.Users
            .Where(u => u.ExternalId == externalUserId)
            .Select(u => u.Id)
            .FirstOrDefaultAsync();

        if (userId == 0)
        {
            throw new InvalidOperationException($"User with external ID {externalUserId} not found");
        }

        return userId;
    }
}