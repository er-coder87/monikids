import { eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDate } from '../utilities/dateUtils';
import { EmptyState } from './EmptyState';
import { Period } from './TimePeriodSelector';

interface ExpenseTrendChartProps {
  amountAtTimeChartData: { date: string; amount: number }[];
  accumulatedAmountChartData: { date: string; accumulatedAmount: number }[];
  dateFormat: 'dd-MM-yyyy' | 'yyyy-MM-dd';
  selectedPeriod: Period;
  currentMonth?: Date;
}

interface CombinedDataPoint {
  date: string;
  amount: number;
}

interface CombinedAccumulatedDataPoint {
  date: string;
  accumulatedAmount: number;
}

type ChartData = CombinedDataPoint | CombinedAccumulatedDataPoint;

const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({
  amountAtTimeChartData,
  accumulatedAmountChartData,
  dateFormat,
  selectedPeriod,
  currentMonth = new Date()
}) => {
  const [showAccumulated, setShowAccumulated] = useState(false);

  const handleToggleAccumulated = () => {
    setShowAccumulated(!showAccumulated);
  };

  const fillMissingDays = <T extends ChartData>(data: T[], isAccumulated: boolean): T[] => {
    if (selectedPeriod === 'all') return data;

    let start: Date;
    let end: Date;

    if (selectedPeriod === 'monthly') {
      start = startOfMonth(currentMonth);
      end = endOfMonth(currentMonth);
    } else {
      start = startOfYear(currentMonth);
      end = endOfYear(currentMonth);
    }

    const allDays = eachDayOfInterval({ start, end });
    const dataMap = new Map(data.map(item => [item.date, item]));

    return allDays.map(day => {
      const formattedDate = formatDate(day, dateFormat);
      const existingData = dataMap.get(formattedDate);

      if (existingData) return existingData;

      if (isAccumulated) {
        // For accumulated data, find the last known value before this date
        const lastKnownValue = Array.from(dataMap.entries())
          .filter(([date]) => new Date(date) < day)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())[0]?.[1];

        return {
          date: formattedDate,
          accumulatedAmount: (lastKnownValue as CombinedAccumulatedDataPoint)?.accumulatedAmount || 0
        } as T;
      }

      return {
        date: formattedDate,
        amount: 0
      } as T;
    });
  };

  const combinedAmountData: CombinedDataPoint[] = amountAtTimeChartData.reduce((acc, curr) => {
    const formattedDate = formatDate(new Date(curr.date), dateFormat)
    const existingEntry = acc.find((item) => item.date === formattedDate);

    if (existingEntry) {
      existingEntry.amount += curr.amount;
    } else {
      acc.push({ date: formattedDate, amount: curr.amount });
    }
    return acc;
  }, [] as CombinedDataPoint[]);

  // Sort the combined amount data by date
  combinedAmountData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Combine accumulated amounts for the same day
  const combinedAccumulatedAmountData: CombinedAccumulatedDataPoint[] = accumulatedAmountChartData.reduce(
    (acc, curr) => {
      const formattedDate = formatDate(new Date(curr.date), dateFormat)
      const existingEntry = acc.find((item) => item.date === formattedDate);

      if (existingEntry) {
        existingEntry.accumulatedAmount = Math.max(existingEntry.accumulatedAmount, curr.accumulatedAmount);
      } else {
        acc.push({ date: formattedDate, accumulatedAmount: curr.accumulatedAmount });
      }
      return acc;
    },
    [] as CombinedAccumulatedDataPoint[]
  );

  // Sort the combined accumulated amount data by date
  combinedAccumulatedAmountData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Fill in missing days with zero values for monthly view
  const filledAmountData = fillMissingDays(combinedAmountData, false);
  const filledAccumulatedData = fillMissingDays(combinedAccumulatedAmountData, true);

  if (combinedAccumulatedAmountData.length > 0 || combinedAmountData.length > 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Expense Trend</h2>
          <button
            onClick={handleToggleAccumulated}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Show {showAccumulated ? 'amount' : 'accumulated amount'}
          </button>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={showAccumulated ? filledAccumulatedData : filledAmountData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                stroke="#6B7280"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  color: 'inherit',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, showAccumulated ? 'Accumulated Amount' : 'Amount']}
                labelStyle={{ color: '#6B7280', fontSize: '12px' }}
                itemStyle={{ color: '#2563eb', fontSize: '14px', fontWeight: '500' }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                content={({ payload }) => (
                  <div className="flex justify-center text-sm text-gray-500 dark:text-gray-400">
                    {payload?.[0]?.value}
                  </div>
                )}
              />
              <Line
                type="monotone"
                dataKey={showAccumulated ? 'accumulatedAmount' : 'amount'}
                stroke="#2563eb"
                strokeWidth={2}
                dot={{
                  r: 3,
                  strokeWidth: 2,
                  stroke: '#2563eb',
                  fill: 'white',
                  strokeDasharray: '0',
                }}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: '#2563eb',
                  fill: 'white',
                }}
                name={showAccumulated ? 'Accumulated Amount' : 'Amount'}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return <></>
};

export default ExpenseTrendChart;
