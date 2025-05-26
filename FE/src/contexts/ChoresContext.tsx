import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { apiClient } from '../services/ApiClient'
import { ChoreDto } from '../models/ChoreDto'
import { useAuth0 } from '@auth0/auth0-react'

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
    const { isAuthenticated, isLoading: isAuthLoading, getAccessTokenSilently } = useAuth0()

    async function fetchChores() {
        if (!isAuthenticated || isAuthLoading) return

        setIsLoading(true)
        try {
            const token = await getAccessTokenSilently();
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
            console.error('Error fetching chores:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const addChore = async (chore: CreateChoreRequest) => {
        setIsLoading(true)
        try {
            const token = await getAccessTokenSilently();
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
            throw error
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
            const token = await getAccessTokenSilently();
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
            console.error('Error updating chore:', error)
            throw error
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