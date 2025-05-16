import type { Category, CreateCategory } from '../types/category'

export const createCategory = async (category: CreateCategory): Promise<Category> => {
    const token = localStorage.getItem('authToken')
    const response = await fetch(import.meta.env.VITE_API_URL + '/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(category)
    })

    if (!response.ok) {
        throw new Error(`Failed to create category: ${response.statusText}`)
    }

    return response.json()
}

export const deleteCategory = async (id: string): Promise<void> => {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error(`Failed to delete category: ${response.statusText}`)
    }
}

export const fetchCategories = async (): Promise<Category[]> => {
    const token = localStorage.getItem('authToken')
    const response = await fetch(import.meta.env.VITE_API_URL + '/categories', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    return response.json()
} 