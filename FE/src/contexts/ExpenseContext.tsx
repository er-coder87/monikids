import { createContext, useContext, useState, ReactNode } from 'react'
import { Expense } from '../models/Expense'
import { useToast } from './ToastContext'
import { apiClient } from '../services/ApiClient'

interface ExpenseContextType {
    expenses: Expense[]
    totalExpenses: number
    addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>
    updateExpense: (expense: Expense) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    refetch: () => Promise<void>
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [totalExpenses, setTotalExpenses] = useState(0)
    const { addToast } = useToast()

    const addExpense = async (expense: Omit<Expense, 'id'>) => {
        try {
            const response = await apiClient.post<Expense>('/expenses', expense)
            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const newExpense = response.data
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
            const response = await apiClient.put<Expense>(`/expenses/${updatedExpense.id}`, updatedExpense)
            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const updatedData = response.data
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
            const response = await apiClient.delete(`/expenses/${id}`)
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

    const refetch = async () => {
        try {
            const response = await apiClient.get<Expense[]>('/expenses')
            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const expensesData = response.data
            setExpenses(expensesData)
            setTotalExpenses(expensesData.reduce((sum, expense) => sum + expense.amount, 0))
        } catch (error) {
            console.error('Error fetching expenses:', error)
            addToast('Failed to fetch expenses', 'error')
            throw error
        }
    }

    return (
        <ExpenseContext.Provider value={{ expenses, totalExpenses, addExpense, updateExpense, deleteExpense, refetch }}>
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