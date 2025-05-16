export interface CreateExpense {
  date: Date | undefined; // Maps from DateTime
  description: string; // Maps from TransactionDetails
  amount: number; // Maps from decimal
  category: string; // Maps from Category?.Name
}
