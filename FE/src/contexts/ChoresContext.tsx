import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { apiClient } from '../services/ApiClient'
import { useUser } from './UserContext'

interface ChoreDto {
    id: number
    description: string | null
    maxCount: number | null
    currentCount: number | null
    allowanceAmount: number | null
    completeDateTime: string | null
}

interface CreateChoreRequest {
    description: string
    maxCount: number
    currentCount: number
    allowanceAmount: number
}

interface ChoresContextType {
    chores: ChoreDto[]
    setChores: (chores: ChoreDto[]) => void
    addChore: (chore: CreateChoreRequest) => Promise<void>
    updateChore: (choreId: number, updates: Partial<ChoreDto>) => Promise<void>
    deleteChore: (choreId: number) => Promise<void>
    completeChore: (choreId: number) => Promise<void>
    isLoading: boolean
}

const ChoresContext = createContext<ChoresContextType | undefined>(undefined)

interface ChoresProviderProps {
    children: ReactNode
}

export function ChoresProvider({ children }: ChoresProviderProps) {
    const [chores, setChores] = useState<ChoreDto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const { isAuthenticated, isLoading: isAuthLoading } = useUser()

    async function fetchChores() {
        if (!isAuthenticated || isAuthLoading) return

        setIsLoading(true)
        try {
            const response = await apiClient.get<ChoreDto[]>('/chores')

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

    useEffect(() => {
        if (isAuthenticated && !isAuthLoading) {
            fetchChores()
        }
    }, [isAuthenticated, isAuthLoading])

    const addChore = async (chore: CreateChoreRequest) => {
        setIsLoading(true)
        try {
            const response = await apiClient.post<ChoreDto>('/chores', chore)

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

    const updateChore = async (choreId: number, updates: Partial<ChoreDto>) => {
        setIsLoading(true)
        try {
            const response = await apiClient.put<ChoreDto>(`/chores/${choreId}`, updates)

            if (response.error) {
                throw new Error(response.error)
            }

            if (!response.data) {
                throw new Error('No data received')
            }

            setChores(prev => prev.map(chore =>
                chore.id === choreId ? (response.data as ChoreDto) : chore
            ))
        } catch (error) {
            console.error('Error updating chore:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const deleteChore = async (choreId: number) => {
        setIsLoading(true)
        try {
            const response = await apiClient.delete(`/chores/${choreId}`)

            if (response.error) {
                throw new Error(response.error)
            }

            setChores(prev => prev.filter(chore => chore.id !== choreId))
        } catch (error) {
            console.error('Error deleting chore:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const completeChore = async (choreId: number) => {
        setIsLoading(true)
        try {
            const response = await apiClient.put<ChoreDto>(`/chores/${choreId}/complete`, {})

            if (response.error) {
                throw new Error(response.error)
            }

            if (!response.data) {
                throw new Error('No data received')
            }

            setChores(prev => prev.map(chore =>
                chore.id === choreId ? (response.data as ChoreDto) : chore
            ))
        } catch (error) {
            console.error('Error completing chore:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ChoresContext.Provider value={{
            chores,
            setChores,
            addChore,
            updateChore,
            deleteChore,
            completeChore,
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