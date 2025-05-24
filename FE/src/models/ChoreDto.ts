export interface ChoreDto {
    id: number
    description: string | null
    maxCount: number | null
    currentCount: number | null
    allowanceAmount: number | null
    paidAtDateTime: string | null
    doneDateTime: string | null
    createdDateTime: string
    isDeleted: boolean | null
} 