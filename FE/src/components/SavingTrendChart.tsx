import { eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, format, isValid } from 'date-fns';
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EmptyState } from './EmptyState';
import { Period } from './TimePeriodSelector';
import { Saving } from '../models/Saving';

interface SavingTrendChartProps {
    savings: Saving[];
    dateFormat: 'dd-MM-yyyy' | 'yyyy-MM-dd';
    selectedPeriod: Period;
    currentMonth?: Date;
}

type ChartData = {
    date: string;
    savings: number;
    cashouts: number;
}

const SavingTrendChart: React.FC<SavingTrendChartProps> = ({
    savings,
    dateFormat,
    selectedPeriod,
    currentMonth = new Date()
}) => {
    const chartData = useMemo(() => {
        if (!savings.length) return [];

        // Group savings by date
        const groupedData = savings.reduce((acc, saving) => {
            const date = format(saving.date, dateFormat);
            if (!acc[date]) {
                acc[date] = { savings: 0, cashouts: 0 };
            }
            if (saving.type === 'saving') {
                acc[date].savings += saving.amount;
            } else if (saving.type === 'cash_out') {
                acc[date].cashouts += Math.abs(saving.amount);
            }
            return acc;
        }, {} as Record<string, { savings: number; cashouts: number }>);

        // Convert to array and sort by date
        return Object.entries(groupedData)
            .map(([date, data]) => ({
                date,
                savings: data.savings,
                cashouts: data.cashouts
            }))
            .sort((a, b) => {
                const dateA = new Date(a.date.split('-').reverse().join('-'));
                const dateB = new Date(b.date.split('-').reverse().join('-'));
                return dateA.getTime() - dateB.getTime();
            });
    }, [savings, dateFormat]);

    const fillMissingDays = (data: ChartData[]): ChartData[] => {
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
                    savings: 0,
                    cashouts: 0
                };
            }

            const formattedDate = format(day, dateFormat);
            const existingData = dataMap.get(formattedDate);

            if (existingData) return existingData;

            return {
                date: formattedDate,
                savings: 0,
                cashouts: 0
            };
        });
    };

    const filledData = fillMissingDays(chartData);

    if (savings.length === 0) {
        return <EmptyState title="No Data" message="No savings data available" />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Savings Trend</h2>
            </div>
            <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filledData}>
                        <defs>
                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorCashouts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1} />
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
                            tickFormatter={(value) => {
                                const date = new Date(value.split('-').reverse().join('-'));
                                return format(date, 'dd MMM');
                            }}
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
                            formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                            labelStyle={{ color: '#6B7280', fontSize: '12px' }}
                            itemStyle={{ color: '#2563eb', fontSize: '14px', fontWeight: '500' }}
                            labelFormatter={(label) => {
                                const date = new Date(label.split('-').reverse().join('-'));
                                return format(date, 'dd MMM yyyy');
                            }}
                        />
                        <Bar
                            dataKey="savings"
                            fill="url(#colorSavings)"
                            name="Savings"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="cashouts"
                            fill="url(#colorCashouts)"
                            name="Cashouts"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SavingTrendChart; 