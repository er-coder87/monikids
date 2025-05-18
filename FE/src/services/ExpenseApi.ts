import { Expense } from '../models/Expense'; // Adjust path
import { Transaction } from '../models/Transaction'; // Adjust path
import { CreateExpense } from './CreateExpense';
import { apiClient } from './ApiClient';

export const fetchExpenses = async (): Promise<Expense[]> => {
  const response = await apiClient.get<{ transactions: Transaction[] }>('/transactions');

  if (response.error) throw new Error(response.error);
  if (!response.data) throw new Error('No data received');

  const data: Transaction[] = response.data.transactions;
  const transformedExpenses: Expense[] = data
    .filter((transaction) => transaction.amount > 0)
    .map((transaction) => ({
      id: transaction.id || '',
      date: new Date(transaction.transactionDate), // Assuming transactionDate is a string that can be parsed by Date
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category?.name || '',
    }));

  return transformedExpenses;
};

export const deleteExpense = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/transactions/${id}`);
  if (response.error) throw new Error(response.error);
};

export const getExpenseById = async (id: string): Promise<Transaction> => {
  const response = await apiClient.get<Transaction>(`/transactions/${id}`);
  if (response.error) throw new Error(response.error);
  if (!response.data) throw new Error('No data received');
  return response.data;
};

export const updateExpense = async (id: string, updatedExpense: Transaction): Promise<Transaction> => {
  const response = await apiClient.put<Transaction>(`/transactions/${id}`, updatedExpense);
  if (response.error) throw new Error(response.error);
  if (!response.data) throw new Error('No data received');
  return response.data;
};

export const addExpense = async (newExpense: CreateExpense): Promise<Expense | null> => {
  try {
    const today = new Date();
    // Transform the frontend Expense structure to DetailedTransaction for the backend
    const detailedTransaction: Transaction = {
      id: undefined, // Let the backend handle ID generation
      transactionDate: newExpense.date ? newExpense.date.toISOString() : today.toISOString(), // Or use the date from newExpenseData if available
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category ? { id: undefined, name: newExpense.category } : undefined,
    };

    const response = await apiClient.post<Transaction[]>('/transactions', [detailedTransaction]);

    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');

    const updatedTransactions = response.data;
    return {
      id: updatedTransactions[0].id!,
      date: new Date(updatedTransactions[0].transactionDate),
      description: updatedTransactions[0].description,
      amount: updatedTransactions[0].amount,
      category: updatedTransactions[0].category?.name || '',
    };
  } catch (error: any) {
    console.error('Error adding expense:', error.message);
    return null;
  }
};
