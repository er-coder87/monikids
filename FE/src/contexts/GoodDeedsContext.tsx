import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { apiClient } from '../services/ApiClient'
import { useUser } from './UserContext'
import { useToast } from './ToastContext'

interface GoodDeedDto {
    id: number
    maxCount: number | null
    currentCount: number | null
}

interface UpdateGoodDeedRequest {
    maxCount?: number
    currentCount?: number
}

interface GoodDeedsContextType {
    goodDeed: GoodDeedDto
    setGoodDeed: (goodDeed: GoodDeedDto) => void
    updateGoodDeed: (request: UpdateGoodDeedRequest) => Promise<void>
    isLoading: boolean
}

const GoodDeedsContext = createContext<GoodDeedsContextType | undefined>(undefined)

interface GoodDeedsProviderProps {
    children: ReactNode
}

export function GoodDeedsProvider({ children }: GoodDeedsProviderProps) {
    const [goodDeed, setGoodDeed] = useState<GoodDeedDto>({
        id: 1,
        maxCount: 10,
        currentCount: 0
    })
    const [isLoading, setIsLoading] = useState(true)
    const { isAuthenticated, isLoading: isAuthLoading } = useUser()
    const { addToast } = useToast()

    const fetchGoodDeed = useCallback(async () => {
        if (!isAuthenticated || isAuthLoading) return

        setIsLoading(true)
        try {
            const response = await apiClient.get<{ goodDeeds: GoodDeedDto }>('/good-deeds')
            if (response.error) {
                if (response.error.includes('401')) {
                    // Don't show error toast for 401, just return
                    return
                }
                throw new Error(response.error)
            }
            if (!response.data) throw new Error('No data received')

            setGoodDeed(response.data.goodDeeds)
        } catch (error) {
            console.error('Error fetching good deed:', error)
            if (!(error instanceof Error && error.message.includes('401'))) {
                addToast('Failed to fetch good deed', 'error')
            }
        } finally {
            setIsLoading(false)
        }
    }, [isAuthenticated, isAuthLoading, addToast])

    // Initial fetch when authenticated
    useEffect(() => {
        if (isAuthenticated && !isAuthLoading) {
            fetchGoodDeed()
        }
    }, [isAuthenticated, isAuthLoading, fetchGoodDeed])

    const updateGoodDeed = useCallback(async (request: UpdateGoodDeedRequest) => {
        try {
            const response = await apiClient.put<{ goodDeeds: GoodDeedDto }>(`/good-deeds`, request)

            if (response.error) {
                if (response.error.includes('401')) {
                    throw new Error('Unauthorized')
                }
                throw new Error(response.error)
            }

            if (!response.data) {
                throw new Error('No data received')
            }
            setGoodDeed(response.data.goodDeeds)
        } catch (error) {
            console.error('Error updating good deed:', error)
            throw error
        }
    }, [])

    return (
        <GoodDeedsContext.Provider value={{ goodDeed, setGoodDeed, updateGoodDeed, isLoading }}>
            {children}
        </GoodDeedsContext.Provider>
    )
}

export function useGoodDeeds() {
    const context = useContext(GoodDeedsContext)
    if (context === undefined) {
        throw new Error('useGoodDeeds must be used within a GoodDeedsProvider')
    }
    return context
} 