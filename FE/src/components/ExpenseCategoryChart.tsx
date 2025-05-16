import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Expense } from '../models/Expense';
import { EmptyState } from './EmptyState';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { isWithinInterval } from 'date-fns';

interface ExpenseCategoryChartProps {
  expenses: Expense[];
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#84CC16', // Lime
];

const UNCATEGORIZED_CATEGORY = 'Uncategorized';

const getCategoryData = (expenses: Expense[]): CategoryData[] => {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return Object.entries(
    expenses.reduce(
      (acc, expense) => {
        const categoryName = expense.category || UNCATEGORIZED_CATEGORY;
        acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
        return acc;
      },
      {} as Record<string, number>
    )
  ).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0
  }));
};

type SortByType = 'name' | 'value';
type SortOrder = 'ascending' | 'descending';

const ExpenseCategoryChart: React.FC<ExpenseCategoryChartProps> = ({
  expenses,
}) => {
  const { selectedPeriod, currentMonth } = useTimePeriod();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<CategoryData[]>([]);
  const [sortedCategoryData, setSortedCategoryData] = useState<CategoryData[]>([]);
  const [sortBy, setSortBy] = useState<SortByType | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('descending');
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  // Filter expenses based on selected time period
  useEffect(() => {
    const start = new Date(currentMonth);
    const end = new Date(currentMonth);

    switch (selectedPeriod) {
      case 'monthly':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case 'yearly':
        start.setMonth(0);
        start.setDate(1);
        end.setMonth(11);
        end.setDate(31);
        break;
      default:
        // For 'all' period, use the entire year
        start.setMonth(0);
        start.setDate(1);
        end.setMonth(11);
        end.setDate(31);
    }

    const filtered = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start, end });
    });

    setFilteredExpenses(filtered);
  }, [expenses, selectedPeriod, currentMonth]);

  // Update chart data when filtered expenses change
  useEffect(() => {
    const newChartData = getCategoryData(filteredExpenses);
    setChartData(newChartData);
    setSortedCategoryData(newChartData);
  }, [filteredExpenses]);

  // Handle sorting
  useEffect(() => {
    if (sortBy) {
      const sorted = [...chartData].sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'ascending'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else {
          return sortOrder === 'ascending'
            ? a.value - b.value
            : b.value - a.value;
        }
      });
      setSortedCategoryData(sorted);
    } else {
      setSortedCategoryData(chartData);
    }
  }, [chartData, sortBy, sortOrder]);

  const handleSort = (type: SortByType) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'ascending' ? 'descending' : 'ascending');
    } else {
      setSortBy(type);
      setSortOrder('descending');
    }
  };

  if (filteredExpenses.length === 0) {
    return <EmptyState title="No expenses to display" message="Add some expenses to see your spending breakdown." />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Expense Categories</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSort('name')}
            className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${sortBy === 'name'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Name
            {sortBy === 'name' && (
              sortOrder === 'ascending' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => handleSort('value')}
            className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${sortBy === 'value'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            Amount
            {sortBy === 'value' && (
              sortOrder === 'ascending' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                activeIndex={activeIndex}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                    stroke="white"
                    strokeWidth={2}
                    className="transition-all duration-200"
                    style={{
                      opacity: activeIndex === undefined || activeIndex === index ? 1 : 0.5
                    }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                        <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          ${data.value.toFixed(2)} ({data.percentage.toFixed(1)}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {sortedCategoryData.map((category, index) => {
            const chartIndex = chartData.findIndex(item => item.name === category.name);
            return (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                onMouseEnter={() => setActiveIndex(chartIndex)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[chartIndex % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.name === UNCATEGORIZED_CATEGORY ? 'Uncategorized' : category.name}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {category.percentage.toFixed(1)}%
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${category.value.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExpenseCategoryChart;
