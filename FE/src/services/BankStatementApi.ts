import { Transaction } from '../models/Transaction';
import { Expense } from '../models/Expense';
import { apiClient } from './ApiClient';

export const uploadBankStatement = async (formData: FormData): Promise<Expense[]> => {
  try {
    const response = await apiClient.post<{ transactions: Transaction[] }>('/bankstatements/upload', formData);

    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error('No data received');

    const newExpenses: Expense[] = response.data.transactions
      .filter((transaction: { amount: number }) => transaction.amount > 0)
      .map((transaction: Transaction) => ({
        id: transaction.id || crypto.randomUUID(),
        date: new Date(transaction.transactionDate),
        description: transaction.description,
        amount: Math.round(transaction.amount * 100) / 100,
        category: transaction.category?.name || undefined,
      }));

    return newExpenses;
  } catch (error: any) {
    console.error('Error during upload:', error.message);
    throw new Error(`Error during upload: ${error.message}`);
  }
};
