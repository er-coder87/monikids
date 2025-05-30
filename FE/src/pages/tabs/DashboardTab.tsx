import { useEffect, useState } from "react";
import ExpenseCategoryChart from "../../components/ExpenseCategoryChart";
import ExpenseTrendChart from "../../components/ExpenseTrendChart";
import SavingTrendChart from "../../components/SavingTrendChart";
import { Expense } from "../../models/Expense";
import { Saving } from "../../models/Saving";
import { useExpenses } from "../../contexts/ExpenseContext";
import { useSavings } from "../../contexts/SavingsContext";
import { TimePeriodSelector } from "../../components/TimePeriodSelector";

interface DashboardTabProps {
    dateFormat: 'dd-MM-yyyy' | 'yyyy-MM-dd'
    selectedPeriod: 'monthly' | 'yearly' | 'all'
    currentMonth: Date
}

export function DashboardTab({ dateFormat, selectedPeriod, currentMonth }: DashboardTabProps) {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [savings, setSavings] = useState<Saving[]>([])
    const { expenses: allExpenses } = useExpenses()
    const { savingsOrCashOuts: allSavings } = useSavings()

    // Filter expenses based on selected period
    useEffect(() => {
        let filteredExpenses = [...allExpenses]

        switch (selectedPeriod) {
            case 'monthly':
                const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
                filteredExpenses = allExpenses.filter(expense => {
                    const date = new Date(expense.date)
                    return date >= monthStart && date <= monthEnd
                })
                break
            case 'yearly':
                const yearStart = new Date(currentMonth.getFullYear(), 0, 1)
                const yearEnd = new Date(currentMonth.getFullYear(), 11, 31)
                filteredExpenses = allExpenses.filter(expense => {
                    const date = new Date(expense.date)
                    return date >= yearStart && date <= yearEnd
                })
                break
            case 'all':
            default:
                break
        }
        setExpenses(filteredExpenses)
    }, [allExpenses, selectedPeriod, currentMonth])

    // Filter savings based on selected period
    useEffect(() => {
        let filteredSavings = [...allSavings]

        switch (selectedPeriod) {
            case 'monthly':
                const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
                filteredSavings = allSavings.filter((saving: Saving) => {
                    const date = new Date(saving.date)
                    return date >= monthStart && date <= monthEnd
                })
                break
            case 'yearly':
                const yearStart = new Date(currentMonth.getFullYear(), 0, 1)
                const yearEnd = new Date(currentMonth.getFullYear(), 11, 31)
                filteredSavings = allSavings.filter((saving: Saving) => {
                    const date = new Date(saving.date)
                    return date >= yearStart && date <= yearEnd
                })
                break
            case 'all':
            default:
                break
        }
        setSavings(filteredSavings)
    }, [allSavings, selectedPeriod, currentMonth])

    return (
        <div className="flex flex-col space-y-4">
            {/* --- Charts --- */}
            <div className='flex justify-start'>
                <TimePeriodSelector dateFormat={dateFormat} />
            </div>

            <div className="lg:col-span-2 flex flex-col space-y-4">
                <SavingTrendChart
                    savings={savings}
                    dateFormat={dateFormat}
                    selectedPeriod={selectedPeriod}
                    currentMonth={currentMonth}
                />
                <ExpenseTrendChart
                    expenses={expenses}
                    dateFormat={dateFormat}
                    selectedPeriod={selectedPeriod}
                    currentMonth={currentMonth}
                />
                <ExpenseCategoryChart
                    expenses={expenses}
                />
            </div>
        </div>
    )
} 