import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { Expense } from '../models/Expense'
import { apiClient } from '../services/ApiClient'
import type { ApiTransaction, ApiResponse } from '../types/api'
import { useAuth0 } from '@auth0/auth0-react'

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
    fetchExpense: () => Promise<void>
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const { isAuthenticated, isLoading: isAuthLoading, getAccessTokenSilently } = useAuth0()

    const fetchExpense = async () => {
        if (!isAuthenticated || isAuthLoading) return

        setIsLoading(true)
        try {
            const token = await getAccessTokenSilently();
            const response = await apiClient.get<{ transactions: ApiTransaction[] }>('/transactions', token)
            if (response.error) throw new Error(response.error)
            if (!response.data?.transactions) throw new Error('No data received')

            const expensesData = response.data.transactions
                .filter(transaction => transaction.type == 'expense')
                .map(transformApiTransaction)

            setExpenses(expensesData)
            setTotalExpenses(expensesData.reduce((sum, expense) => sum + expense.amount, 0))
        } catch (error) {
            console.error('Error fetching expenses:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        try {
            const adjustedExpense = {
                ...expense,
                amount: -Math.abs(expense.amount),
                type: 'expense'
            };
            const token = await getAccessTokenSilently();
            const response = await apiClient.post<ApiResponse>('/transactions', adjustedExpense, token)
            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const newExpense = transformApiTransaction(response.data.transaction)
            setExpenses(prev => [...prev, newExpense])
            setTotalExpenses(prev => prev + expense.amount)
        } catch (error) {
            console.error('Error adding expense:', error)
            throw error
        }
    }

    const updateExpense = async (updatedExpense: Expense) => {
        try {
            const token = await getAccessTokenSilently();
            const response = await apiClient.put<ApiResponse>(`/transactions/${updatedExpense.id}`, updatedExpense, token)
            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const updatedData = transformApiTransaction(response.data.transaction)
            setExpenses(prev => prev.map(expense =>
                expense.id === updatedExpense.id ? updatedData : expense
            ))
            const newTotal = expenses.reduce((sum, expense) =>
                expense.id === updatedExpense.id ? sum + updatedData.amount : sum + expense.amount, 0)
            setTotalExpenses(newTotal)
        } catch (error) {
            console.error('Error updating expense:', error)
            throw error
        }
    }

    const deleteExpense = async (id: string) => {
        try {
            const token = await getAccessTokenSilently();
            const response = await apiClient.delete(`/transactions/${id}`, token)
            if (response.error) throw new Error(response.error)

            const expense = expenses.find(e => e.id === id)
            if (expense) {
                setTotalExpenses(prev => prev - expense.amount)
                setExpenses(prev => prev.filter(e => e.id !== id))
            }
        } catch (error) {
            console.error('Error deleting expense:', error)
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
            fetchExpense,
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