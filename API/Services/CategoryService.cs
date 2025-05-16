using ExpenseTrackerApi.Models;
using ExpenseTrackerApi.Repositories;

namespace ExpenseTrackerApi.Services;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetCategoriesByUserIdAsync(long userId);
    Task<Category?> GetCategoryByIdAsync(long userId, long id);
    Task<IEnumerable<Category>> UpsertCategoriesAsync(long userId, IEnumerable<Category> categories);
    Task<bool> DeleteCategoryAsync(long userId, long id);
    Task<Category?> UpdateCategoryAsync(long userId, Category category);
}

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(ICategoryRepository categoryRepository, ILogger<CategoryService> logger)
    {
        _categoryRepository = categoryRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<Category>> GetCategoriesByUserIdAsync(long userId)
    {
        try
        {
            return await _categoryRepository.GetByUserIdAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving categories for user {UserId}", userId);
            throw;
        }
    }

    public async Task<Category?> GetCategoryByIdAsync(long userId, long id)
    {
        try
        {
            return await _categoryRepository.GetByIdAndUserIdAsync(id, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving category {CategoryId} for user {UserId}", id, userId);
            throw;
        }
    }

    public async Task<IEnumerable<Category>> UpsertCategoriesAsync(long userId, IEnumerable<Category> categories)
    {
        try
        {
            var updatedCategories = new List<Category>();
            foreach (var category in categories)
            {
                category.UserId = userId;
                if (category.Id == 0) // Create
                {
                    var createdCategory = await _categoryRepository.AddAsync(category);
                    if (createdCategory != null)
                    {
                        updatedCategories.Add(createdCategory);
                    }
                }
                else // Update
                {
                    var existingCategory = await _categoryRepository.GetByIdAndUserIdAsync(category.Id, userId);
                    if (existingCategory != null)
                    {
                        existingCategory.Name = category.Name;
                        existingCategory.BudgetId = category.BudgetId;
                        existingCategory.ParentCategoryId = category.ParentCategoryId;
                        // Update other properties as needed

                        var updated = await _categoryRepository.UpdateAsync(existingCategory);
                        if (updated != null)
                        {
                            updatedCategories.Add(updated);
                        }
                    }
                    else
                    {
                        _logger.LogWarning("Category with ID {CategoryId} not found for user {UserId}, skipping upsert.", category.Id, userId);
                    }
                }
            }
            return updatedCategories;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error upserting categories for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> DeleteCategoryAsync(long userId, long id)
    {
        try
        {
            var categoryToDelete = await _categoryRepository.GetByIdAndUserIdAsync(id, userId);
            if (categoryToDelete != null)
            {
                return await _categoryRepository.DeleteAsync(categoryToDelete);
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category {CategoryId} for user {UserId}", id, userId);
            throw;
        }
    }

    public async Task<Category?> UpdateCategoryAsync(long userId, Category category)
    {
        try
        {
            var existingCategory = await _categoryRepository.GetByIdAndUserIdAsync(category.Id, userId);
            if (existingCategory != null)
            {
                existingCategory.Name = category.Name ?? existingCategory.Name;
                existingCategory.BudgetId = category.BudgetId ?? existingCategory.BudgetId;
                existingCategory.ParentCategoryId = category.ParentCategoryId ?? existingCategory.ParentCategoryId;

                return await _categoryRepository.UpdateAsync(existingCategory);
            }
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category {CategoryId} for user {UserId}", category.Id, userId);
            throw;
        }
    }
}