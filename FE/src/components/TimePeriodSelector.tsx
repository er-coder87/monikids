import { addMonths, format, subMonths } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useTimePeriod } from "../contexts/TimePeriodContext";

export type Period = 'all' | 'monthly' | 'yearly'

interface TimePeriodSelectorProps {
    dateFormat: 'dd-MM-yyyy' | 'yyyy-MM-dd';
}

export function TimePeriodSelector({ dateFormat }: TimePeriodSelectorProps) {
    const { selectedPeriod, currentMonth, setSelectedPeriod, setCurrentMonth } = useTimePeriod();

    const handlePeriodChange = (period: Period) => {
        setSelectedPeriod(period);
    };

    const handleMonthChange = (direction: 'prev' | 'next') => {
        const newMonth = direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
        setCurrentMonth(newMonth);
    };

    return (
        <div className="flex flex-col sm:flex-row w-full sm:w-fit items-start sm:items-center gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                    {(['all', 'monthly', 'yearly'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => handlePeriodChange(period)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === period
                                    ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {(selectedPeriod === 'monthly' || selectedPeriod === 'yearly') && (
                <div className="flex items-center gap-2 w-full sm:w-auto sm:pl-2 sm:border-l border-t sm:border-t-0 border-gray-200 dark:border-gray-700 pt-3 sm:pt-0">
                    <button
                        onClick={() => handleMonthChange('prev')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                    <span className="text-gray-700 dark:text-gray-300 flex-1 sm:flex-none sm:min-w-32 text-center font-medium">
                        {selectedPeriod === 'monthly'
                            ? format(currentMonth, 'MMMM yyyy')
                            : format(currentMonth, 'yyyy')}
                    </span>
                    <button
                        onClick={() => handleMonthChange('next')}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>
            )}
        </div>
    )
}
