using ExpenseTrackerApi.Models;
using ExpenseTrackerApi.Repositories;

namespace ExpenseTrackerApi.Services;

public interface IBudgetService
{
    Task<Budget?> CreateBudgetAsync(Budget budget, List<long> categoryIds);
    Task<Budget?> GetBudgetByIdAsync(long userId, long id);
    Task<Budget?> UpdateBudgetAsync(Budget budget, List<long> categoryIds);
    Task<bool> DeleteBudgetAsync(long userId, long id);
}

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _budgetRepository;
    private readonly ICategoryRepository _categoryRepository; // Need Category Repository
    private readonly ILogger<BudgetService> _logger;

    public BudgetService(IBudgetRepository budgetRepository, ICategoryRepository categoryRepository, ILogger<BudgetService> logger)
    {
        _budgetRepository = budgetRepository;
        _categoryRepository = categoryRepository;
        _logger = logger;
    }

    public async Task<Budget?> CreateBudgetAsync(Budget budget, List<long> categoryIds)
    {
        try
        {
            var categories = await _categoryRepository.GetByIdsAsync(categoryIds);
            budget.Categories = categories.ToList();
            return await _budgetRepository.AddAsync(budget);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating budget for user {UserId}", budget.UserId);
            return null;
        }
    }

    public async Task<Budget?> GetBudgetByIdAsync(long userId, long id)
    {
        try
        {
            return await _budgetRepository.GetByIdAndUserIdWithCategoriesAsync(id, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving budget {BudgetId} for user {UserId}", id, userId);
            return null;
        }
    }

    public async Task<Budget?> UpdateBudgetAsync(Budget budget, List<long> categoryIds)
    {
        try
        {
            var existingBudget = await _budgetRepository.GetByIdAndUserIdWithCategoriesAsync(budget.Id, budget.UserId);
            if (existingBudget == null)
            {
                _logger.LogWarning("Budget with ID {BudgetId} not found for user {UserId}", budget.Id, budget.UserId);
                return null;
            }

            // Update scalar properties
            existingBudget.Name = budget.Name;
            existingBudget.BudgetType = budget.BudgetType;
            existingBudget.Year = budget.Year;
            existingBudget.Month = budget.Month;
            existingBudget.Amount = budget.Amount;
            existingBudget.IsOngoing = budget.IsOngoing;

            // Update categories
            var categoriesToAdd = (await _categoryRepository.GetByIdsAsync(categoryIds))
                .Where(c => !existingBudget.Categories.Any(bc => bc.Id == c.Id))
                .ToList();

            var categoriesToRemove = existingBudget.Categories
                .Where(bc => !categoryIds.Contains(bc.Id))
                .ToList();

            foreach (var category in categoriesToAdd)
            {
                existingBudget.Categories.Add(category);
            }

            foreach (var category in categoriesToRemove)
            {
                existingBudget.Categories.Remove(category);
            }

            return await _budgetRepository.UpdateAsync(existingBudget);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating budget {BudgetId} for user {UserId}", budget.Id, budget.UserId);
            return null;
        }
    }

    public async Task<bool> DeleteBudgetAsync(long userId, long id)
    {
        try
        {
            var budgetToDelete = await _budgetRepository.GetByIdAndUserIdAsync(id, userId);
            if (budgetToDelete != null)
            {
                return await _budgetRepository.DeleteAsync(budgetToDelete);
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting budget {BudgetId} for user {UserId}", id, userId);
            return false;
        }
    }
}
