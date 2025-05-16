import { format, parseISO } from "date-fns";

export const formatDate = (dateString: string | Date, formatString: string): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return ''; // Or some other fallback
  }
};

// Takes a Date object or valid date string and returns 'YYYY-MM-DD'
export const formatDateToDay = (dateInput: Date | string | number): string => {
  // Handle potential epoch numbers or ensure it's a Date object
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    // Handle invalid date input if necessary, maybe return an empty string or throw
    console.warn('Invalid date input:', dateInput);
    return 'Invalid Date';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Define Your Data Types (Example) ---
interface ChartDataPoint {
  date: Date | string; // Assuming original data might have Date objects or ISO strings
  amount?: number;
  accumulatedAmount?: number;
}

interface ProcessedChartDataPoint {
  date: string; // Will hold 'YYYY-MM-DD'
  amount?: number;
  accumulatedAmount?: number;
}

export const aggregateByDay_SumAmount = (data: ChartDataPoint[]): ProcessedChartDataPoint[] => {
  if (!data) {
    return [];
  }

  const grouped = new Map<string, number>(); // Map<YYYY-MM-DD, totalAmount>

  // Sort by date first to process in chronological order (optional but good practice)
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const item of sortedData) {
    if (item.amount === undefined || item.amount === null) continue; // Skip items without an amount

    const dayString = formatDateToDay(item.date);
    if (dayString === 'Invalid Date') continue; // Skip invalid dates

    const currentSum = grouped.get(dayString) || 0;
    grouped.set(dayString, currentSum + item.amount);
  }

  // Convert map back to array suitable for Recharts
  const result: ProcessedChartDataPoint[] = [];
  grouped.forEach((amount, date) => {
    result.push({ date, amount });
  });

  // Sort final result by date string
  return result.sort((a, b) => a.date.localeCompare(b.date));
};

// Example: Aggregates by taking the *last* 'accumulatedAmount' for each day
export const aggregateByDay_LastAccumulated = (data: ChartDataPoint[]): ProcessedChartDataPoint[] => {
  if (!data) {
    return [];
  }

  const grouped = new Map<string, number>(); // Map<YYYY-MM-DD, lastAccumulatedAmount>

  // Sort by date first to ensure the last item processed for a day is truly the latest
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const item of sortedData) {
    if (item.accumulatedAmount === undefined || item.accumulatedAmount === null) continue; // Skip items without accumulatedAmount

    const dayString = formatDateToDay(item.date);
    if (dayString === 'Invalid Date') continue; // Skip invalid dates

    // Since data is sorted by time, this will overwrite previous values for the same day,
    // leaving the last one encountered.
    grouped.set(dayString, item.accumulatedAmount);
  }

  // Convert map back to array
  const result: ProcessedChartDataPoint[] = [];
  grouped.forEach((accumulatedAmount, date) => {
    result.push({ date, accumulatedAmount });
  });

  // Sort final result by date string
  return result.sort((a, b) => a.date.localeCompare(b.date));
};
