import { useState, useEffect, useCallback } from 'react';
import { Expense } from '../models/Expense';
import { fetchExpenses } from '../services/ExpenseApi';

interface UseFetchExpensesOutput {
  fetchedExpenses: Expense[];
  loading: boolean;
  error: string | null;
  refetch: () => void; // Add the refetch function to the interface
}

const useFetchExpenses = (): UseFetchExpensesOutput => {
  const [fetchedExpenses, setFetchedExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpensesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const expenses = await fetchExpenses();
      setFetchedExpenses(expenses);
    } catch (e: any) {
      setError(e.message || 'An error occurred while fetching expenses.');
      setFetchedExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies as the URL is constant

  useEffect(() => {
    fetchExpensesData(); // Initial fetch
  }, [fetchExpensesData]);

  return {
    fetchedExpenses,
    loading,
    error,
    refetch: fetchExpensesData, // Return the fetch function as refetch
  };
};

export default useFetchExpenses;
