export interface Expense {
  id: string; // There's no direct 'id' in your C# model, you might need to generate this on the frontend or backend
  date: Date; // Maps from DateTime
  description: string; // Maps from TransactionDetails
  amount: number; // Maps from decimal
  category?: string; // Maps from Category?.Name
}
