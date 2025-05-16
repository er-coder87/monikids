using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface IBudgetRepository
{
    Task<Budget?> GetByIdAsync(long id);
    Task<Budget?> GetByIdAndUserIdAsync(long id, long userId);
    Task<Budget?> GetByIdAndUserIdWithCategoriesAsync(long id, long userId);
    Task<Budget> AddAsync(Budget budget);
    Task<Budget?> UpdateAsync(Budget budget);
    Task<bool> DeleteAsync(Budget budget);
}

public class BudgetRepository(PostgresContext dbContext) : IBudgetRepository
{

    public async Task<Budget?> GetByIdAsync(long id)
    {
        return await dbContext.Budgets.FindAsync(id);
    }

    public async Task<Budget?> GetByIdAndUserIdAsync(long id, long userId)
    {
        return await dbContext.Budgets
            .Where(b => b.Id == id && b.UserId == userId)
            .FirstOrDefaultAsync();
    }

    public async Task<Budget?> GetByIdAndUserIdWithCategoriesAsync(long id, long userId)
    {
        return await dbContext.Budgets
            .Where(b => b.Id == id && b.UserId == userId)
            .Include(b => b.Categories)
            .FirstOrDefaultAsync();
    }

    public async Task<Budget> AddAsync(Budget budget)
    {
        dbContext.Budgets.Add(budget);
        await dbContext.SaveChangesAsync();
        return budget;
    }

    public async Task<Budget?> UpdateAsync(Budget budget)
    {
        var existingBudget = await dbContext.Budgets
            .Where(b => b.Id == budget.Id)
            .Include(b => b.Categories)
            .FirstOrDefaultAsync();

        if (existingBudget != null)
        {
            dbContext.Entry(existingBudget).CurrentValues.SetValues(budget);

            // Handle categories explicitly in the service layer
            await dbContext.SaveChangesAsync();
            return existingBudget;
        }
        return null;
    }

    public async Task<bool> DeleteAsync(Budget budget)
    {
        dbContext.Budgets.Remove(budget);
        var changes = await dbContext.SaveChangesAsync();
        return changes > 0;
    }
}