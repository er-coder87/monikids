import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { useToast } from './ToastContext'
import { apiClient } from '../services/ApiClient'
import type { ApiTransaction, ApiResponse } from '../types/api'

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
    refetch: () => Promise<void>
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
    const { addToast } = useToast()

    const refetch = useCallback(async () => {
        try {
            const response = await apiClient.get<{ message: string, transactions: ApiTransaction[] }>('/transactions')
            if (response.error) throw new Error(response.error)
            if (!response.data?.transactions) throw new Error('No data received')

            const savingsData = response.data.transactions
                .map(transformApiTransaction)

            setSavings(savingsData)
            setTotalSavings(savingsData.reduce((sum, saving) => sum + saving.amount, 0))
        } catch (error) {
            console.error('Error fetching savings:', error)
            addToast('Failed to fetch savings', 'error')
            throw error
        }
    }, [addToast])

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
            addToast(`Added saving: ${saving.description}`)
        } catch (error) {
            console.error('Error adding saving:', error)
            addToast('Failed to add saving', 'error')
            throw error
        }
    }, [addToast])

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
            addToast(`Updated saving: ${updatedSaving.description}`)
        } catch (error) {
            console.error('Error updating saving:', error)
            addToast('Failed to update saving', 'error')
            throw error
        }
    }, [addToast, savings])

    const deleteSaving = useCallback(async (id: string) => {
        try {
            const response = await apiClient.delete(`/transactions/${id}`)
            if (response.error) throw new Error(response.error)

            const saving = savings.find(s => s.id === id)
            if (saving) {
                setTotalSavings(prev => prev - saving.amount)
                setSavings(prev => prev.filter(s => s.id !== id))
                addToast(`Deleted saving: ${saving.description}`)
            }
        } catch (error) {
            console.error('Error deleting saving:', error)
            addToast('Failed to delete saving', 'error')
            throw error
        }
    }, [addToast, savings])

    return (
        <SavingsContext.Provider value={{ savings, totalSavings, addSaving, updateSaving, deleteSaving, refetch }}>
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