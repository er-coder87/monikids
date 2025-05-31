import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { apiClient } from '../services/ApiClient'
import useAuth from '../hooks/useAuth'

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
    fetchGoodDeed: () => Promise<void>
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
    const { supabaseClient } = useAuth();

    async function fetchGoodDeed() {
        setIsLoading(true)
        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.get<{ goodDeeds: GoodDeedDto }>('/good-deeds', token)
            if (response.error) {
                if (response.error.startsWith('401:')) return
                throw new Error(response.error)
            }
            if (!response.data) throw new Error('No data received')

            setGoodDeed(response.data.goodDeeds)
        } catch (error) {
            throw new Error('Error calling API')
        } finally {
            setIsLoading(false)
        }
    }

    const updateGoodDeed = async (request: UpdateGoodDeedRequest) => {
        try {
            const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
            const token = sessionData?.session?.access_token || '';
            const response = await apiClient.put<{ goodDeeds: GoodDeedDto }>(`/good-deeds`, request, token)

            if (response.error) {
                if (response.error.startsWith('401:')) {
                    throw new Error('Unauthorized')
                }
                throw new Error(response.error)
            }

            if (!response.data) {
                throw new Error('No data received')
            }
            setGoodDeed(response.data.goodDeeds)
        } catch (error) {
            throw new Error('Error calling API')
        }
    }

    return (
        <GoodDeedsContext.Provider value={{ goodDeed, setGoodDeed, updateGoodDeed, fetchGoodDeed, isLoading }}>
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