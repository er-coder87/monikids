export interface Chore {
    id: string
    description: string
    frequency: number
    savingAmount: number
    completedCount: number
    savingAdded?: boolean
}