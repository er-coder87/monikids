import { createContext, useContext, useState, ReactNode } from 'react'

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
    addSaving: (saving: Omit<Saving, 'id'>) => void
    updateSaving: (saving: Saving) => void
    deleteSaving: (id: string) => void
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined)

export function SavingsProvider({ children }: { children: ReactNode }) {
    const [savings, setSavings] = useState<Saving[]>([])
    const [totalSavings, setTotalSavings] = useState(0)

    const addSaving = (saving: Omit<Saving, 'id'>) => {
        const newSaving = { ...saving, id: crypto.randomUUID() }
        setSavings(prev => [...prev, newSaving])
        setTotalSavings(prev => prev + saving.amount)
    }

    const updateSaving = (updatedSaving: Saving) => {
        setSavings(prev => prev.map(saving =>
            saving.id === updatedSaving.id ? updatedSaving : saving
        ))
        // Recalculate total savings
        const newTotal = savings.reduce((sum, saving) =>
            saving.id === updatedSaving.id ? sum + updatedSaving.amount : sum + saving.amount, 0)
        setTotalSavings(newTotal)
    }

    const deleteSaving = (id: string) => {
        const saving = savings.find(s => s.id === id)
        if (saving) {
            setTotalSavings(prev => prev - saving.amount)
            setSavings(prev => prev.filter(s => s.id !== id))
        }
    }

    return (
        <SavingsContext.Provider value={{ savings, totalSavings, addSaving, updateSaving, deleteSaving }}>
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