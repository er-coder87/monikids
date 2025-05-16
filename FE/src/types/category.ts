export interface Category {
    id: string
    name: string
    parentId?: string
    color?: string
}

export interface CreateCategory {
    name: string
    parentId?: string
    color?: string
} 