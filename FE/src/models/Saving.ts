export interface Saving {
    id: string
    description: string
    amount: number
    date: Date
    isRecurring: boolean
    recurringFrequency?: 'daily' | 'weekly' | 'monthly'
    type?: 'saving' | 'cash_out'
}