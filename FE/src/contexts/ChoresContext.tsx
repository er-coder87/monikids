import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { apiClient } from '../services/ApiClient'
import { useToast } from './ToastContext'
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
    completeDateTime?: Date
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
    const { addToast } = useToast()
    const { isAuthenticated } = useUser()

    const fetchChores = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await apiClient.get<ChoreDto[]>('/chores')

            console.log("response.data", response.data)
            if (response.error) {
                throw new Error(response.error)
            }

            if (!response.data) {
                throw new Error('No data received')
            }

            setChores(response.data)
        } catch (error) {
            console.error('Error fetching chores:', error)
            addToast('Failed to fetch chores', 'error')
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    useEffect(() => {
        if (isAuthenticated) {
            fetchChores()
        }
    }, [isAuthenticated, fetchChores])

    const addChore = useCallback(async (chore: CreateChoreRequest) => {
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
            addToast('Chore added successfully')
        } catch (error) {
            console.error('Error adding chore:', error)
            addToast('Failed to add chore', 'error')
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    const updateChore = useCallback(async (choreId: number, updates: Partial<ChoreDto>) => {
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
            addToast('Failed to update chore', 'error')
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    const deleteChore = useCallback(async (choreId: number) => {
        setIsLoading(true)
        try {
            const response = await apiClient.delete(`/chores/${choreId}`)

            if (response.error) {
                throw new Error(response.error)
            }

            setChores(prev => prev.filter(chore => chore.id !== choreId))
            addToast('Chore deleted successfully')
        } catch (error) {
            console.error('Error deleting chore:', error)
            addToast('Failed to delete chore', 'error')
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

    const completeChore = useCallback(async (choreId: number) => {
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
            addToast('Chore completed successfully')
        } catch (error) {
            console.error('Error completing chore:', error)
            addToast('Failed to complete chore', 'error')
            throw error
        } finally {
            setIsLoading(false)
        }
    }, [addToast])

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