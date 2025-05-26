
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

public class TransactionRepository(PostgresContext postgresContext) : ITransactionRepository
{
    public async Task<Transaction> AddTransactionAsync(string externalUserId, Transaction transaction)
    {
        var userId = await GetUserIdFromExternalId(externalUserId);
        transaction.UserId = userId;
        transaction.CreatedAt = DateTime.UtcNow;
    
        postgresContext.Transactions.Add(transaction);
        await postgresContext.SaveChangesAsync();
    
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
        var existingTransactions = await postgresContext.Transactions
            .Join(postgresContext.Users,
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
            await postgresContext.Transactions.AddRangeAsync(transactionsToInsert);
        }

        if (transactionsToUpdate.Any())
        {
            postgresContext.Transactions.UpdateRange(transactionsToUpdate);
        }

        await postgresContext.SaveChangesAsync();

        return incomingTransactions;
    }
    
    public async Task<IEnumerable<Transaction>> GetTransactionsAsync(string externalUserId, TransactionFilter? filter = null)
    {
        var query = postgresContext.Transactions
            .Join(postgresContext.Users,
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
        return await postgresContext.Transactions
            .Join(postgresContext.Users,
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
        var transaction = await postgresContext.Transactions
            .Join(postgresContext.Users,
                t => t.UserId,
                u => u.Id,
                (t, u) => new { Transaction = t, User = u })
            .Where(x => x.User.ExternalId == externalUserId && x.Transaction.Id == id)
            .Select(x => x.Transaction)
            .FirstOrDefaultAsync();

        if (transaction != null)
        {
            postgresContext.Transactions.Remove(transaction);
            await postgresContext.SaveChangesAsync();
        }
    }

    public async Task<Transaction?> UpdateTransactionAsync(string externalUserId, Transaction updatedTransaction)
    {
        var userId = await GetUserIdFromExternalId(externalUserId);
        var existingTransaction = await postgresContext.Transactions
            .Join(postgresContext.Users,
                t => t.UserId,
                u => u.Id,
                (t, u) => new { Transaction = t, User = u })
            .Where(x => x.User.ExternalId == externalUserId && x.Transaction.Id == updatedTransaction.Id)
            .Select(x => x.Transaction)
            .FirstOrDefaultAsync();

        if (existingTransaction != null)
        {
            postgresContext.Entry(existingTransaction).CurrentValues.SetValues(updatedTransaction);

            // Ensure UserId cannot be changed through this update method
            existingTransaction.UserId = userId;

            // Handle Category update if the ID is different
            if (existingTransaction.CategoryId != updatedTransaction.CategoryId)
            {
                existingTransaction.CategoryId = updatedTransaction.CategoryId;
                existingTransaction.Category = await postgresContext.Categories.FindAsync(updatedTransaction.CategoryId);
            }

            await postgresContext.SaveChangesAsync();
            return existingTransaction;
        }

        return null;
    }

    private async Task<long> GetUserIdFromExternalId(string externalUserId)
    {
        var userId = await postgresContext.Users
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