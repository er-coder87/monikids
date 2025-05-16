import { Expense } from '../models/Expense';

export const formatDateForChart = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getAmountAtTimeData = (expenses: Expense[]): { date: string; amount: number; description: string }[] => {
  return expenses
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((expense) => ({
      date: formatDateForChart(expense.date),
      amount: expense.amount,
      description: expense.description,
    }));
};

export const getAccumulatedAmountData = (expenses: Expense[]): { date: string; accumulatedAmount: number }[] => {
  const sortedExpenses = expenses.sort((a, b) => a.date.getTime() - b.date.getTime());
  let accumulatedAmount = 0;
  return sortedExpenses.map((expense) => {
    accumulatedAmount += expense.amount;
    return { date: formatDateForChart(expense.date), accumulatedAmount };
  });
};

export const getCategoryData = (expenses: Expense[]): { name: string; value: number }[] => {
  const categoryTotals: { [key: string]: number } = {};
  expenses.forEach((expense) => {
    if (expense.category) {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    } else {
      categoryTotals['N/A'] = (categoryTotals['N/A'] || 0) + expense.amount;
    }
  });
  return Object.keys(categoryTotals).map((name) => ({ name, value: categoryTotals[name] }));
};
