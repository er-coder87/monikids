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
    savingsOrCashOuts: Saving[]
    addSaving: (saving: Omit<Saving, 'id'>) => Promise<void>
    updateSaving: (saving: Saving) => Promise<void>
    deleteSaving: (id: string) => Promise<void>
    withdraw: (amount: number) => Promise<void>
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
    const [savingsOrCashOuts, setSavingsOrCashOuts] = useState<Saving[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { isAuthenticated, isLoading: isAuthLoading } = useUser()

    const refetch = async () => {
        if (!isAuthenticated || isAuthLoading) return

        setIsLoading(true)
        try {
            const response = await apiClient.get<{ transactions: ApiTransaction[] }>('/transactions')
            if (response.error) throw new Error(response.error)
            if (!response.data?.transactions) throw new Error('No data received')

            const savingsOrCashOuts = response.data.transactions
                .filter(transaction => transaction.type == 'saving' || transaction.type == 'cash_out')
                .map(transformApiTransaction)
            setSavingsOrCashOuts(savingsOrCashOuts)
        } catch (error) {
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
                type: 'saving', // Mark as savings transaction
                transactionDate: saving.date.toISOString().split('T')[0]
            })

            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const newSaving = transformApiTransaction(response.data.transaction)
            setSavingsOrCashOuts(prev => [...prev, newSaving])
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
            setSavingsOrCashOuts(prev => prev.map(saving =>
                saving.id === updatedSaving.id ? updatedData : saving
            ))
            const newTotal = savingsOrCashOuts.reduce((sum, saving) =>
                saving.id === updatedSaving.id ? sum + updatedData.amount : sum + saving.amount, 0)
        } catch (error) {
            console.error('Error updating saving:', error)
            throw error
        }
    }, [savingsOrCashOuts])

    const deleteSaving = useCallback(async (id: string) => {
        try {
            const response = await apiClient.delete(`/transactions/${id}`)
            if (response.error) throw new Error(response.error)

            const saving = savingsOrCashOuts.find(s => s.id === id)
            if (saving) {
                setSavingsOrCashOuts(prev => prev.filter(s => s.id !== id))
            }
        } catch (error) {
            console.error('Error deleting saving:', error)
            throw error
        }
    }, [savingsOrCashOuts])

    const withdraw = useCallback(async (amount: number) => {
        try {
            const response = await apiClient.post<ApiResponse>('/transactions', {
                amount: -amount, // Negative amount for withdrawal
                description: 'Cash out',
                type: 'cash_out',
                transactionDate: new Date().toISOString(),
                date: new Date().toISOString()
            })

            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const newSaving = transformApiTransaction(response.data.transaction)
            setSavingsOrCashOuts(prev => [...prev, newSaving])
        } catch (error) {
            console.error('Error withdrawing money:', error)
            throw error
        }
    }, [])

    return (
        <SavingsContext.Provider value={{ savingsOrCashOuts, addSaving, updateSaving, deleteSaving, withdraw, isLoading }}>
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