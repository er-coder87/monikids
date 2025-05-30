import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { apiClient } from '../services/ApiClient'
import { ChoreDto } from '../models/ChoreDto'
import useAuth from '../hooks/useAuth'

interface CreateChoreRequest {
    description: string
    maxCount: number
    currentCount: number
    allowanceAmount: number
}

interface ChoresContextType {
    chores: ChoreDto[]
    addChore: (chore: CreateChoreRequest) => Promise<void>
    updateChore: (choreId: number, updates: ChoreDto) => Promise<void>
    fetchChores: () => Promise<void>
    isLoading: boolean
}

const ChoresContext = createContext<ChoresContextType | undefined>(undefined)

interface ChoresProviderProps {
    children: ReactNode
}

export function ChoresProvider({ children }: ChoresProviderProps) {
    const [chores, setChores] = useState<ChoreDto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { supabaseClient } = useAuth();

    const fetchChores = async () => {
        setIsLoading(true)
        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.get<ChoreDto[]>('/chores', token)

            if (response.error) {
                if (response.error.startsWith('401:')) return
                throw new Error(response.error)
            }

            if (!response.data) {
                throw new Error('No data received')
            }

            setChores(response.data)
        } catch (error) {
            throw new Error('Error calling API')
        } finally {
            setIsLoading(false)
        }
    }

    const addChore = async (chore: CreateChoreRequest) => {
        setIsLoading(true)
        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.post<ChoreDto>('/chores', chore, token)

            if (response.error) {
                throw new Error(response.error)
            }

            if (!response.data) {
                throw new Error('No data received')
            }

            setChores(prev => [...prev, response.data as ChoreDto])
        } catch (error) {
            console.error('Error adding chore:', error)
            throw new Error('Error calling API')
        } finally {
            setIsLoading(false)
        }
    }

    const updateChore = async (choreId: number, updates: ChoreDto) => {
        // Optimistically update the UI
        setChores(prev => prev.map(chore =>
            chore.id === choreId ? { ...chore, ...updates } : chore
        ))

        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.put<ChoreDto>(`/chores/${choreId}`, updates, token)

            if (response.error) {
                // Revert the optimistic update on error
                setChores(prev => prev.map(chore =>
                    chore.id === choreId ? { ...chore, ...updates } : chore
                ))
                throw new Error(response.error)
            }

            if (!response.data) {
                throw new Error('No data received')
            }

            // Update with server response
            setChores(prev => prev.map(chore =>
                chore.id === choreId ? (response.data as ChoreDto) : chore
            ))
        } catch (error) {
            throw new Error('Error calling API')
        }
    }

    return (
        <ChoresContext.Provider value={{
            chores,
            addChore,
            updateChore,
            fetchChores,
            isLoading
        }}>
            {children}
        </ChoresContext.Provider>
    )
}

export function useChores() {
    const context = useContext(ChoresContext)
    if (context === undefined) {
        throw new Error('useChores must be used within a ChoresProvider')
    }
    return context
} 