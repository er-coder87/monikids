import type { Category, CreateCategory } from '../types/category'
import { apiClient } from './ApiClient'

export const createCategory = async (category: CreateCategory): Promise<Category> => {
    const response = await apiClient.post<Category>('/categories', category)
    if (response.error) throw new Error(response.error)
    if (!response.data) throw new Error('No data received')
    return response.data
}

export const deleteCategory = async (id: string): Promise<void> => {
    const response = await apiClient.delete(`/categories/${id}`)
    if (response.error) throw new Error(response.error)
}

export const fetchCategories = async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/categories')
    if (response.error) throw new Error(response.error)
    if (!response.data) throw new Error('No data received')
    return response.data
} 