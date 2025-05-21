export interface ApiTransaction {
    id: number
    createdAt: string
    userId: string | null
    transactionDate: string
    amount: number
    categoryId: number | null
    description: string
    category: string | null
}

export interface ApiResponse {
    message: string
    transaction: ApiTransaction
} 