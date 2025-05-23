import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Period } from '../components/TimePeriodSelector'

interface TimePeriodContextType {
    selectedPeriod: Period
    currentMonth: Date
    setSelectedPeriod: (period: Period) => void
    setCurrentMonth: (month: Date) => void
    startDate: Date
    endDate: Date
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

    const getDateRange = () => {
        const start = new Date(currentMonth)
        const end = new Date(currentMonth)

        switch (selectedPeriod) {
            case 'monthly':
                start.setDate(1)
                end.setMonth(end.getMonth() + 1)
                end.setDate(0)
                break
            case 'yearly':
                start.setMonth(0)
                start.setDate(1)
                end.setMonth(11)
                end.setDate(31)
                break
            default:
                // For 'all' period, use the entire year
                start.setMonth(0)
                start.setDate(1)
                end.setMonth(11)
                end.setDate(31)
        }

        return { start, end }
    }

    const { start: startDate, end: endDate } = getDateRange()

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
                setCurrentMonth,
                startDate,
                endDate
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