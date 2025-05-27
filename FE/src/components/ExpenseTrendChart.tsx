import { eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, format, isValid } from 'date-fns';
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, XAxisProps, LineProps } from 'recharts';
import { EmptyState } from './EmptyState';
import { Period } from './TimePeriodSelector';
import { getAmountAtTimeData, getAccumulatedAmountData } from '../utilities/expenseUtils';
import { Expense } from '../models/Expense';

interface ExpenseTrendChartProps {
  expenses: Expense[];
  dateFormat: 'dd-MM-yyyy' | 'yyyy-MM-dd';
  selectedPeriod: Period;
  currentMonth?: Date;
}

type ChartData = {
  date: string;
  amount?: number;
  accumulatedAmount?: number;
}

const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({
  expenses,
  dateFormat,
  selectedPeriod,
  currentMonth = new Date()
}) => {
  const [showAccumulated, setShowAccumulated] = useState(false);

  const handleToggleAccumulated = () => {
    setShowAccumulated(!showAccumulated);
  };

  const chartData = useMemo(() => {
    const amountData = getAmountAtTimeData(expenses);
    const accumulatedData = getAccumulatedAmountData(expenses);

    // Merge expenses on the same date
    const mergedAmountData = amountData.reduce((acc, item) => {
      const date = format(new Date(item.date), dateFormat);
      const existingItem = acc.find(d => d.date === date);

      if (existingItem) {
        existingItem.amount = (existingItem.amount || 0) + item.amount;
      } else {
        acc.push({
          date,
          amount: item.amount
        });
      }
      return acc;
    }, [] as ChartData[]);

    const mergedAccumulatedData = accumulatedData.reduce((acc, item) => {
      const date = format(new Date(item.date), dateFormat);
      const existingItem = acc.find(d => d.date === date);

      if (existingItem) {
        existingItem.accumulatedAmount = (existingItem.accumulatedAmount || 0) + item.accumulatedAmount;
      } else {
        acc.push({
          date,
          accumulatedAmount: item.accumulatedAmount
        });
      }
      return acc;
    }, [] as ChartData[]);

    // Sort data by date
    mergedAmountData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    mergedAccumulatedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      amountData: mergedAmountData,
      accumulatedData: mergedAccumulatedData
    };
  }, [expenses, dateFormat]);

  const fillMissingDays = (data: ChartData[], isAccumulated: boolean): ChartData[] => {
    if (!data || data.length === 0) return [];
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

    if (!isValid(start) || !isValid(end)) {
      console.error('Invalid date range:', { start, end });
      return data;
    }

    const allDays = eachDayOfInterval({ start, end });
    const dataMap = new Map(data.map(item => [item.date, item]));

    return allDays.map(day => {
      if (!isValid(day)) {
        console.error('Invalid day:', day);
        return {
          date: format(new Date(), dateFormat),
          amount: 0,
          accumulatedAmount: 0
        };
      }

      const formattedDate = format(day, dateFormat);
      const existingData = dataMap.get(formattedDate);

      if (existingData) return existingData;

      if (isAccumulated) {
        // For accumulated data, find the last known value before this date
        const lastKnownValue = Array.from(dataMap.entries())
          .filter(([date]) => {
            const parsedDate = new Date(date);
            return isValid(parsedDate) && parsedDate < day;
          })
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())[0]?.[1];

        return {
          date: formattedDate,
          accumulatedAmount: lastKnownValue?.accumulatedAmount || 0
        };
      }

      return {
        date: formattedDate,
        amount: 0
      };
    });
  };

  const filledAmountData = fillMissingDays(chartData.amountData, false);
  const filledAccumulatedData = fillMissingDays(chartData.accumulatedData, true);

  if (expenses.length === 0) {
    return <EmptyState title="No Data" message="No expenses data available" />;
  }

  const renderXAxisTick: XAxisProps['tick'] = (props) => {
    const { x, y, payload } = props;
    const data = showAccumulated ? filledAccumulatedData : filledAmountData;
    const index = data.findIndex(item => item.date === payload.value);
    const isFirst = index === 0;
    const isLast = index === data.length - 1;
    const value = showAccumulated ? data[index]?.accumulatedAmount : data[index]?.amount;

    // Show tick if it's first, last, or has a non-zero value
    if (isFirst || isLast || (value !== undefined && value !== 0)) {
      return (
        <g transform={`translate(${x},${y})`}>
          <text
            x={0}
            y={0}
            dy={16}
            textAnchor="middle"
            fill="#6B7280"
            fontSize={12}
          >
            {payload.value}
          </text>
        </g>
      );
    }
    return <g />;
  };

  const renderDot: LineProps['dot'] = (props) => {
    const { cx, cy, payload } = props;
    const value = showAccumulated ? payload.accumulatedAmount : payload.amount;
    const data = showAccumulated ? filledAccumulatedData : filledAmountData;
    const index = data.findIndex(item => item.date === payload.date);
    const isFirst = index === 0;
    const isLast = index === data.length - 1;

    // Show dot if it's first, last, or has a non-zero value
    if (isFirst || isLast || (value !== undefined && value !== 0)) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={3}
          stroke="#2563eb"
          strokeWidth={2}
          fill="white"
        />
      );
    }
    return <g />;
  };

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
              tick={renderXAxisTick}
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
              dot={renderDot}
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
};

export default ExpenseTrendChart;
