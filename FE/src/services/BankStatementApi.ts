import { Transaction } from '../models/Transaction';
import { Expense } from '../models/Expense';

export const uploadBankStatement = async (formData: FormData): Promise<Expense[]> => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(import.meta.env.VITE_API_URL + "/bankstatements/upload", {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const newExpenses: Expense[] = data.transactions
        .filter((transaction: { amount: number }) => transaction.amount > 0)
        .map((transaction: Transaction) => ({
          id: transaction.id,
          date: new Date(transaction.transactionDate),
          description: transaction.description,
          amount: Math.round(transaction.amount * 100) / 100,
          category: transaction.category?.name || null,
        }));
      return newExpenses;
    } else {
      console.error('File upload failed:', response.status, response.statusText);
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('Error during upload:', error.message);
    throw new Error(`Error during upload: ${error.message}`);
  }
};
