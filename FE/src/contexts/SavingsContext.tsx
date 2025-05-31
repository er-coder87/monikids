import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { apiClient } from '../services/ApiClient'
import type { ApiTransaction, ApiResponse } from '../types/api'
import { Saving } from '../models/Saving'
import useAuth from '../hooks/useAuth'

interface SavingsContextType {
    savingsOrCashOuts: Saving[]
    addSaving: (saving: Omit<Saving, 'id'>) => Promise<void>
    updateSaving: (saving: Saving) => Promise<void>
    deleteSaving: (id: string) => Promise<void>
    withdraw: (amount: number) => Promise<void>
    fetchSaving: () => Promise<void>
    isLoading: boolean
}

const transformApiTransaction = (transaction: ApiTransaction): Saving => ({
    id: transaction.id.toString(),
    date: new Date(transaction.transactionDate),
    amount: transaction.amount,
    description: transaction.description,
    isRecurring: false, // Default to false since API doesn't support recurring yet
    recurringFrequency: 'monthly', // Default to monthly since API doesn't support recurring yet
    type: transaction.type as 'saving' | 'cash_out'
})

const SavingsContext = createContext<SavingsContextType | undefined>(undefined)

export function SavingsProvider({ children }: { children: ReactNode }) {
    const [savingsOrCashOuts, setSavingsOrCashOuts] = useState<Saving[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { supabaseClient } = useAuth();

    const fetchSaving = async () => {
        setIsLoading(true)
        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.get<{ transactions: ApiTransaction[] }>('/transactions', token)
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

    const addSaving = useCallback(async (saving: Omit<Saving, 'id'>) => {
        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.post<ApiResponse>('/transactions', {
                ...saving,
                type: 'saving', // Mark as savings transaction
                transactionDate: saving.date.toISOString().split('T')[0]
            }, token)

            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const newSaving = transformApiTransaction(response.data.transaction)
            setSavingsOrCashOuts(prev => [...prev, newSaving])
        } catch (error) {
            throw new Error('Error calling API')
        }
    }, [])

    const updateSaving = useCallback(async (updatedSaving: Saving) => {
        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.put<ApiResponse>(`/transactions/${updatedSaving.id}`, {
                ...updatedSaving,
                category: 'Savings',
                transactionDate: updatedSaving.date.toISOString().split('T')[0]
            }, token)

            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const updatedData = transformApiTransaction(response.data.transaction)
            setSavingsOrCashOuts(prev => prev.map(saving =>
                saving.id === updatedSaving.id ? updatedData : saving
            ))
            const newTotal = savingsOrCashOuts.reduce((sum, saving) =>
                saving.id === updatedSaving.id ? sum + updatedData.amount : sum + saving.amount, 0)
        } catch (error) {
            throw new Error('Error calling API')
        }
    }, [savingsOrCashOuts])

    const deleteSaving = useCallback(async (id: string) => {
        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.delete(`/transactions/${id}`, token)

            if (response.error) throw new Error(response.error)

            // For 204 responses, response.data will be undefined
            setSavingsOrCashOuts(prev => prev.filter(s => s.id !== id))
        } catch (error) {
            throw new Error('Error calling API')
        }
    }, [savingsOrCashOuts])

    const withdraw = useCallback(async (amount: number) => {
        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.post<ApiResponse>('/transactions', {
                amount: -amount, // Negative amount for withdrawal
                description: '💰 Cash out',
                type: 'cash_out',
                transactionDate: new Date().toISOString(),
                date: new Date().toISOString()
            }, token)

            if (response.error) throw new Error(response.error)
            if (!response.data) throw new Error('No data received')

            const newSaving = transformApiTransaction(response.data.transaction)
            setSavingsOrCashOuts(prev => [...prev, newSaving])
        } catch (error) {
            throw new Error('Error calling API')
        }
    }, [])

    return (
        <SavingsContext.Provider value={{ savingsOrCashOuts, addSaving, updateSaving, deleteSaving, withdraw, fetchSaving, isLoading }}>
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