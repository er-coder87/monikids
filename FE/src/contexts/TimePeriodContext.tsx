import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Period } from '../components/TimePeriodSelector'

interface TimePeriodContextType {
    selectedPeriod: Period
    currentMonth: Date
    setSelectedPeriod: (period: Period) => void
    setCurrentMonth: (month: Date) => void
}

const TimePeriodContext = createContext<TimePeriodContextType | undefined>(undefined)

interface TimePeriodProviderProps {
    children: ReactNode
}

export function TimePeriodProvider({ children }: TimePeriodProviderProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>(() => {
        const saved = localStorage.getItem('selectedPeriod')
        return (saved as Period) || 'all'
    })

    const [currentMonth, setCurrentMonth] = useState<Date>(() => {
        const saved = localStorage.getItem('currentMonth')
        return saved ? new Date(saved) : new Date()
    })

    useEffect(() => {
        localStorage.setItem('selectedPeriod', selectedPeriod)
    }, [selectedPeriod])

    useEffect(() => {
        localStorage.setItem('currentMonth', currentMonth.toISOString())
    }, [currentMonth])

    return (
        <TimePeriodContext.Provider
            value={{
                selectedPeriod,
                currentMonth,
                setSelectedPeriod,
                setCurrentMonth
            }}
        >
            {children}
        </TimePeriodContext.Provider>
    )
}

export function useTimePeriod() {
    const context = useContext(TimePeriodContext)
    if (context === undefined) {
        throw new Error('useTimePeriod must be used within a TimePeriodProvider')
    }
    return context
} 