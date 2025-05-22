import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { apiClient } from '../services/ApiClient'
import type { ApiTransaction, ApiResponse } from '../types/api'
import { useUser } from './UserContext'

interface Saving {
    id: string
    description: string
    amount: number
    date: Date
    isRecurring: boolean
    recurringFrequency?: 'daily' | 'weekly' | 'monthly'
}

interface SavingsContextType {
    savings: Saving[]
    totalSavings: number
    addSaving: (saving: Omit<Saving, 'id'>) => Promise<void>
    updateSaving: (saving: Saving) => Promise<void>
    deleteSaving: (id: string) => Promise<void>
    isLoading: boolean
}

const transformApiTransaction = (transaction: ApiTransaction): Saving => ({
    id: transaction.id.toString(),
    date: new Date(transaction.transactionDate),
    amount: transaction.amount,
    description: transaction.description,
    isRecurring: false, // Default to false since API doesn't support recurring yet
    recurringFrequency: 'monthly' // Default to monthly since API doesn't support recurring yet
})

const SavingsContext = createContext<SavingsContextType | undefined>(undefined)

export function SavingsProvider({ children }: { children: ReactNode }) {
    const [savings, setSavings] = useState<Saving[]>([])
    const [totalSavings, setTotalSavings] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
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
            setSavings(expensesData)
            setTotalSavings(expensesData.reduce((sum, expense) => sum + expense.amount, 0))
        } catch (error) {
            console.error('Error fetching expenses:', error)
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

    const addSaving = useCallback(async (saving: Omit<Saving, 'id'>) => {
        try {
            const response = await apiClient.post<ApiResponse>('/transactions', {
                ...saving,
                category: 'Savings', // Mark as savings transaction
                transactionDate: saving.date.toISOString().split('T')[0]
            })

            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const newSaving = transformApiTransaction(response.data.transaction)
            setSavings(prev => [...prev, newSaving])
            setTotalSavings(prev => prev + saving.amount)
        } catch (error) {
            console.error('Error adding saving:', error)
            throw error
        }
    }, [])

    const updateSaving = useCallback(async (updatedSaving: Saving) => {
        try {
            const response = await apiClient.put<ApiResponse>(`/transactions/${updatedSaving.id}`, {
                ...updatedSaving,
                category: 'Savings',
                transactionDate: updatedSaving.date.toISOString().split('T')[0]
            })

            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const updatedData = transformApiTransaction(response.data.transaction)
            setSavings(prev => prev.map(saving =>
                saving.id === updatedSaving.id ? updatedData : saving
            ))
            const newTotal = savings.reduce((sum, saving) =>
                saving.id === updatedSaving.id ? sum + updatedData.amount : sum + saving.amount, 0)
            setTotalSavings(newTotal)
        } catch (error) {
            console.error('Error updating saving:', error)
            throw error
        }
    }, [savings])

    const deleteSaving = useCallback(async (id: string) => {
        try {
            const response = await apiClient.delete(`/transactions/${id}`)
            if (response.error) throw new Error(response.error)

            const saving = savings.find(s => s.id === id)
            if (saving) {
                setTotalSavings(prev => prev - saving.amount)
                setSavings(prev => prev.filter(s => s.id !== id))
            }
        } catch (error) {
            console.error('Error deleting saving:', error)
            throw error
        }
    }, [savings])

    return (
        <SavingsContext.Provider value={{ savings, totalSavings, addSaving, updateSaving, deleteSaving, isLoading }}>
            {children}
        </SavingsContext.Provider>
    )
}

export function useSavings() {
    const context = useContext(SavingsContext)
    if (context === undefined) {
        throw new Error('useSavings must be used within a SavingsProvider')
    }
    return context
} 