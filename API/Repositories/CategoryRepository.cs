using ExpenseTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTrackerApi.Repositories;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllCategoriesAsync();  
    Task<Category?> GetByIdAsync(long id);
    Task<Category?> GetByIdAndUserIdAsync(long id, long userId);
    Task<IEnumerable<Category>> GetByUserIdAsync(long userId);
    Task<IEnumerable<Category>> GetByIdsAsync(List<long> ids);
    Task<Category> AddAsync(Category entity);
    Task<Category?> UpdateAsync(Category entity);
    Task<bool> DeleteAsync(Category entity);
}

public class CategoryRepository(PostgresContext dbContext) : ICategoryRepository
{
    public async Task<List<Category>> GetAllCategoriesAsync()
    {
        return await dbContext.Categories.OrderBy(c => c.Id).ToListAsync();
    }
    
    public async Task<Category?> GetByIdAsync(long id)
    {
        return await dbContext.Categories.FindAsync(id);
    }

    public async Task<Category?> GetByIdAndUserIdAsync(long id, long userId)
    {
        return await dbContext.Categories
            .Where(c => c.Id == id && c.UserId == userId)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Category>> GetByUserIdAsync(long userId)
    {
        return await dbContext.Categories
            .Where(c => c.UserId == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Category>> GetByIdsAsync(List<long> ids)
    {
        return await dbContext.Categories
            .Where(c => ids.Contains(c.Id))
            .ToListAsync();
    }

    public async Task<Category> AddAsync(Category entity)
    {
        dbContext.Categories.Add(entity);
        await dbContext.SaveChangesAsync();
        return entity;
    }

    public async Task<Category?> UpdateAsync(Category entity)
    {
        var existingCategory = await dbContext.Categories.FindAsync(entity.Id);
        if (existingCategory != null)
        {
            dbContext.Entry(existingCategory).CurrentValues.SetValues(entity);
            await dbContext.SaveChangesAsync();
            return entity;
        }
        return null;
    }

    public async Task<bool> DeleteAsync(Category entity)
    {
        dbContext.Categories.Remove(entity);
        var changes = await dbContext.SaveChangesAsync();
        return changes > 0;
    }
}