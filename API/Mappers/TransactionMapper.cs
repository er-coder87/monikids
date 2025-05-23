using ExpenseTrackerApi.Controllers.Dtos;
using ExpenseTrackerApi.Controllers.RequestDtos;
using ExpenseTrackerApi.Models;

namespace ExpenseTrackerApi.Mappers;

public static class TransactionMapper
{
    public static TransactionDto? ToDto(Transaction? transaction)
    {
        if (transaction == null)
            return null;
        
        return new TransactionDto
        {
            Id = transaction.Id,
            Description = transaction.Description,
            Amount = transaction.Amount,
            TransactionDate = transaction.TransactionDate,
            Type = transaction.Type,
            Category = transaction.Category != null ? CategoryMapper.ToDto(transaction.Category) : null,
        };
    }

    public static List<TransactionDto> ToDtoList(IEnumerable<Transaction> transactions)
    {
        return transactions.Select(ToDto).ToList();
    }
}