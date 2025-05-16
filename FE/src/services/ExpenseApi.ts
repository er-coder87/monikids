import { Expense } from '../models/Expense'; // Adjust path
import { Transaction } from '../models/Transaction'; // Adjust path
import { CreateExpense } from './CreateExpense';

export const fetchExpenses = async (): Promise<Expense[]> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(import.meta.env.VITE_API_URL + "/transactions", {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  const data: Transaction[] = result.transactions;
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
  const token = localStorage.getItem('authToken');
  const response = await fetch(import.meta.env.VITE_API_URL + "/transactions" + `/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

export const getExpenseById = async (id: string): Promise<Transaction> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(import.meta.env.VITE_API_URL + "/transactions" + `/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const updateExpense = async (id: string, updatedExpense: Transaction): Promise<Transaction> => {
  const token = localStorage.getItem('authToken');
  const response = await fetch(import.meta.env.VITE_API_URL + "/transactions" + `/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedExpense),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const addExpense = async (newExpense: CreateExpense): Promise<Expense | null> => {
  try {
    var today = new Date();
    // Transform the frontend Expense structure to DetailedTransaction for the backend
    const detailedTransaction: Transaction = {
      id: undefined, // Let the backend handle ID generation
      transactionDate: newExpense.date ? newExpense.date.toISOString() : today.toISOString(), // Or use the date from newExpenseData if available
      description: newExpense.description,
      amount: newExpense.amount,
      category: newExpense.category ? { id: undefined, name: newExpense.category } : undefined,
    };
    const token = localStorage.getItem('authToken');
    const response = await fetch(import.meta.env.VITE_API_URL + "/transactions", {
      // Using the upsert endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify([detailedTransaction]), // Send as a single-element array
    });

    if (response.ok) {
      const updatedTransactions: Transaction[] = await response.json();
      return {
        id: updatedTransactions[0].id!,
        date: new Date(updatedTransactions[0].transactionDate),
        description: updatedTransactions[0].description,
        amount: updatedTransactions[0].amount,
        category: updatedTransactions[0].category?.name || '',
      };
    } else {
      console.error('API Error adding expense:', response.status);
      return null;
    }
  } catch (error: any) {
    console.error('Error adding expense:', error.message);
    return null;
  }
};
