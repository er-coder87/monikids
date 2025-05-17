import { DollarSign } from 'lucide-react'
import { Expense } from '../../models/Expense'
import { CreateExpense } from '../../services/CreateExpense'
import AddExpenseForm from '../../components/AddExpenseForm'
import FileUpload from '../../components/FileUpload'
import ExpenseTable from '../../components/ExpenseTable'
import ExpenseTrendChart from '../../components/ExpenseTrendChart'
import ExpenseCategoryChart from '../../components/ExpenseCategoryChart'
import { CategoryManager } from '../../components/CategoryManager'
import { TimePeriodSelector } from '../../components/TimePeriodSelector'
import { getAmountAtTimeData, getAccumulatedAmountData } from '../../utilities/expenseUtils'
import type { Category } from '../../types/category'
import { useState, useEffect } from 'react'
import { addExpense, deleteExpense } from '../../services/ExpenseApi'

interface ExpensesTabProps {
    fetchedExpenses: Expense[] | null
    refetch: () => Promise<void>
    dateFormat: 'dd-MM-yyyy' | 'yyyy-MM-dd'
    selectedPeriod: 'monthly' | 'yearly' | 'all'
    currentMonth: Date
}

export function ExpensesTab({
    fetchedExpenses,
    refetch,
    dateFormat,
    selectedPeriod,
    currentMonth
}: ExpensesTabProps) {
    const [allExpenses, setAllExpenses] = useState<Expense[]>([])
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [amountAtTimeChartData, setAmountAtTimeChartData] = useState(getAmountAtTimeData(expenses))
    const [accumulatedAmountChartData, setAccumulatedAmountChartData] = useState(getAccumulatedAmountData(expenses))
    const [categories, setCategories] = useState<Category[]>([])

    useEffect(() => {
        if (fetchedExpenses) {
            setAllExpenses(fetchedExpenses)
        }
    }, [fetchedExpenses])

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

    useEffect(() => {
        setAmountAtTimeChartData(getAmountAtTimeData(expenses))
        setAccumulatedAmountChartData(getAccumulatedAmountData(expenses))
    }, [expenses])

    const handleAddExpense = async (newExpenseData: CreateExpense) => {
        try {
            const response = await addExpense(newExpenseData)
            if (response) {
                setAllExpenses((prevExpenses) => [...prevExpenses, response])
                refetch()
            } else {
                console.error('Failed to add expense.')
            }
        } catch (error: any) {
            console.error('Error adding expense:', error.message)
        }
    }

    const handleEditExpense = async (id: string) => {
        try {
            const expenseToEdit = allExpenses.find(expense => expense.id === id)
            if (!expenseToEdit) {
                console.error('Expense not found')
                return
            }

            setAllExpenses(prevExpenses =>
                prevExpenses.map(expense =>
                    expense.id === id ? expenseToEdit : expense
                )
            )

            await refetch()
        } catch (error: any) {
            console.error('Error editing expense:', error.message)
        }
    }

    const handleDeleteExpense = async (id: string) => {
        try {
            await deleteExpense(id)
            setAllExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id))
            refetch()
        } catch (error: any) {
            console.error('Error deleting expense:', error.message)
        }
    }

    const handleExpensesUploaded = (newExpenses: Expense[]) => {
        setAllExpenses((prevExpenses) => [...prevExpenses, ...newExpenses])
    }

    const handleCategoryCreated = (category: Category) => {
        setCategories(prev => [...prev, category])
    }

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    return (
        <div className='flex flex-col space-y-4'>
            <div className='flex justify-start'>
                <TimePeriodSelector dateFormat={dateFormat} />
            </div>

            <div className='flex justify-start'>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 w-fit">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-3">
                            <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    ({expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'})
                                </span>
                            </div>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">${totalExpenses.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* --- Charts --- */}
                <div className="lg:col-span-2 flex flex-col space-y-4">
                    <ExpenseTrendChart
                        amountAtTimeChartData={amountAtTimeChartData}
                        accumulatedAmountChartData={accumulatedAmountChartData}
                        dateFormat={dateFormat}
                        selectedPeriod={selectedPeriod}
                        currentMonth={currentMonth}
                    />
                    <ExpenseCategoryChart
                        expenses={expenses}
                    />
                </div>

                {/* --- Forms and Upload --- */}
                <div className="space-y-4">
                    <AddExpenseForm onAddExpense={handleAddExpense} />
                    <CategoryManager
                        onCategoryCreated={handleCategoryCreated}
                        existingCategories={categories}
                    />
                    <FileUpload onExpensesUploaded={handleExpensesUploaded} />
                </div>
            </div>

            {/* --- Expense Table --- */}
            <ExpenseTable
                expenses={expenses}
                onDelete={handleDeleteExpense}
                onEdit={handleEditExpense}
                dateFormat={dateFormat}
                categories={categories}
            />
        </div>
    )
} 