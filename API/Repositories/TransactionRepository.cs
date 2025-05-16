using ExpenseTrackerApi.Controllers;
using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface ITransactionRepository
{
    Task<IEnumerable<Transaction>> UpsertTransactionsAsync(long userId, IEnumerable<Transaction> transactions);
    Task<IEnumerable<Transaction>> GetTransactionsAsync(long userId, TransactionFilter? filter = null);
    Task<Transaction?> GetTransactionByIdAsync(long userId, long id);
    Task DeleteTransactionAsync(long userId,long id);
    Task<Transaction?> UpdateTransactionAsync(long userId, Transaction updatedTransaction);
}

public class TransactionRepository(PostgresContext postgresContext) : ITransactionRepository
{
    public async Task<IEnumerable<Transaction>> UpsertTransactionsAsync(long userId,
        IEnumerable<Transaction> transactions)
    {
        var incomingTransactions = transactions.ToList();
        var transactionsToInsert = new List<Transaction>();
        var transactionsToUpdate = new List<Transaction>();

        // Fetch all existing transactions for the user
        var existingTransactions = await postgresContext.Transactions
            .Where(t => t.UserId == userId)
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
    
    public async Task<IEnumerable<Transaction>> GetTransactionsAsync(long userId, TransactionFilter? filter = null)
    {
        var query = postgresContext.Transactions
            .Include(a => a.User)
            .Where(a => a.User != null && a.User.Id == userId)
            .Include(t => t.Category)
            .AsQueryable();

        if (filter != null)
        {
            if (filter.StartDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate >= DateOnly.FromDateTime(filter.StartDate.Value));
            }

            if (filter.EndDate.HasValue)
            {
                query = query.Where(t => t.TransactionDate <= DateOnly.FromDateTime(filter.EndDate.Value.Date.AddDays(1)));
            }
        }

        return await query.ToListAsync();
    }

    public async Task<Transaction?> GetTransactionByIdAsync(long userId, long id)
    {
        return await postgresContext.Transactions
            .Include(t => t.User)
            .Where(a => a.User != null && a.User.Id == userId)
            .Include(t => t.Category)  // Include the related Category
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task DeleteTransactionAsync(long userId, long id)
    {
        var transaction = await postgresContext.Transactions
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

        if (transaction != null)
        {
            postgresContext.Transactions.Remove(transaction);
            await postgresContext.SaveChangesAsync();
        }
    }

    public async Task<Transaction?> UpdateTransactionAsync(long userId, Transaction updatedTransaction)
    {
        var existingTransaction = await postgresContext.Transactions
            .FirstOrDefaultAsync(t => t.Id == updatedTransaction.Id && t.UserId == userId);

        if (existingTransaction != null)
        {
            postgresContext.Entry(existingTransaction).CurrentValues.SetValues(updatedTransaction);

            // Ensure UserId cannot be changed through this update method
            existingTransaction.UserId = userId;

            // Handle Category update if the ID is different
            if (existingTransaction.CategoryId != updatedTransaction.CategoryId)
            {
                existingTransaction.CategoryId = updatedTransaction.CategoryId;
                // Assuming Category is a navigation property and you want EF to track the change
                existingTransaction.Category = await postgresContext.Categories.FindAsync(updatedTransaction.CategoryId);
            }

            await postgresContext.SaveChangesAsync();
            return existingTransaction;
        }

        return null;
    }
}
