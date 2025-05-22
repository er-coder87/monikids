import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Expense } from '../models/Expense'
import { useToast } from './ToastContext'
import { apiClient } from '../services/ApiClient'
import type { ApiTransaction, ApiResponse } from '../types/api'
import { useUser } from './UserContext'

const transformApiTransaction = (transaction: ApiTransaction): Expense => ({
    id: transaction.id.toString(),
    date: new Date(transaction.transactionDate),
    amount: transaction.amount,
    description: transaction.description,
    category: transaction.category || undefined
})

interface ExpenseContextType {
    expenses: Expense[]
    totalExpenses: number
    isLoading: boolean
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>
    updateExpense: (expense: Expense) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const { addToast } = useToast()
    const { isAuthenticated, isLoading: isAuthLoading } = useUser()

    const refetch = async () => {
        if (!isAuthenticated || isAuthLoading) return

        setIsLoading(true)
        try {
            const response = await apiClient.get<{ message: string, transactions: ApiTransaction[] }>('/transactions')
            if (response.error) throw new Error(response.error)
            if (!response.data?.transactions) throw new Error('No data received')

            const expensesData = response.data.transactions
                .map(transformApiTransaction)
            setExpenses(expensesData)
            setTotalExpenses(expensesData.reduce((sum, expense) => sum + expense.amount, 0))
        } catch (error) {
            console.error('Error fetching expenses:', error)
            addToast('Failed to fetch expenses', 'error')
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    // Initial fetch when authenticated
    useEffect(() => {
        if (isAuthenticated && !isAuthLoading) {
            refetch()
        }
    }, [isAuthenticated, isAuthLoading])

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        try {
            console.log('Sending expense data:', JSON.stringify(expense, null, 2))
            const response = await apiClient.post<ApiResponse>('/transactions', expense)
            console.log('API Response:', response)
            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const newExpense = transformApiTransaction(response.data.transaction)
            setExpenses(prev => [...prev, newExpense])
            setTotalExpenses(prev => prev + expense.amount)
            addToast(`Added expense: ${expense.description}`)
        } catch (error) {
            console.error('Error adding expense:', error)
            addToast('Failed to add expense', 'error')
            throw error
        }
    }

    const updateExpense = async (updatedExpense: Expense) => {
        try {
            const response = await apiClient.put<ApiResponse>(`/transactions/${updatedExpense.id}`, updatedExpense)
            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const updatedData = transformApiTransaction(response.data.transaction)
            setExpenses(prev => prev.map(expense =>
                expense.id === updatedExpense.id ? updatedData : expense
            ))
            const newTotal = expenses.reduce((sum, expense) =>
                expense.id === updatedExpense.id ? sum + updatedData.amount : sum + expense.amount, 0)
            setTotalExpenses(newTotal)
            addToast(`Updated expense: ${updatedExpense.description}`)
        } catch (error) {
            console.error('Error updating expense:', error)
            addToast('Failed to update expense', 'error')
            throw error
        }
    }

    const deleteExpense = async (id: string) => {
        try {
            const response = await apiClient.delete(`/transactions/${id}`)
            if (response.error) throw new Error(response.error)

            const expense = expenses.find(e => e.id === id)
            if (expense) {
                setTotalExpenses(prev => prev - expense.amount)
                setExpenses(prev => prev.filter(e => e.id !== id))
                addToast(`Deleted expense: ${expense.description}`)
            }
        } catch (error) {
            console.error('Error deleting expense:', error)
            addToast('Failed to delete expense', 'error')
            throw error
        }
    }

    return (
        <ExpenseContext.Provider value={{
            expenses,
            totalExpenses,
            isLoading,
            addExpense,
            updateExpense,
            deleteExpense,
        }}>
            {children}
        </ExpenseContext.Provider>
    )
}

export function useExpenses() {
    const context = useContext(ExpenseContext)
    if (!context) {
        throw new Error('useExpenses must be used within an ExpenseProvider')
    }
    return context
} 