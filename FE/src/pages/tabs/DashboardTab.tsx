import { useEffect, useState } from "react";
import ExpenseCategoryChart from "../../components/ExpenseCategoryChart";
import ExpenseTrendChart from "../../components/ExpenseTrendChart";
import { Expense } from "../../models/Expense";
import { useExpenses } from "../../contexts/ExpenseContext";
import { TimePeriodSelector } from "../../components/TimePeriodSelector";
import { useToast } from "../../contexts/ToastContext";

interface DashboardTabProps {
    dateFormat: 'dd-MM-yyyy' | 'yyyy-MM-dd'
    selectedPeriod: 'monthly' | 'yearly' | 'all'
    currentMonth: Date
}

export function DashboardTab({ dateFormat, selectedPeriod, currentMonth }: DashboardTabProps) {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const { expenses: allExpenses, refetch } = useExpenses()
    const { addToast } = useToast()

    // Initial fetch
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                await refetch()
            } catch (error) {
                console.error('Error fetching expenses:', error)
                addToast('Failed to fetch expenses', 'error')
            }
        }
        fetchExpenses()
    }, []) // Empty dependency array for initial fetch only

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

    return (
        <div className="flex flex-col space-y-4">
            {/* --- Charts --- */}
            <div className='flex justify-start'>
                <TimePeriodSelector dateFormat={dateFormat} />
            </div>

            <div className="lg:col-span-2 flex flex-col space-y-4">
                {/* <ExpenseTrendChart
                    expenses={expenses}
                    dateFormat={dateFormat}
                    selectedPeriod={selectedPeriod}
                    currentMonth={currentMonth}
                /> */}
                <ExpenseCategoryChart
                    expenses={expenses}
                />
            </div>
        </div>
    )
} 