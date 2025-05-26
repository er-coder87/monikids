const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
    data?: T
    error?: string
}

class ApiClient {
    private static instance: ApiClient

    private constructor() {
    }

    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient()
        }
        return ApiClient.instance
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        token: string
    ): Promise<ApiResponse<T>> {
        const headers = new Headers({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...(options.headers as Record<string, string> || {})
        })

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include', // Important for cookies
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'An error occurred' }))
                return { error: error.message || 'An error occurred' }
            }

            const data = await response.json()
            return { data }
        } catch (error) {
            return { error: 'Network error occurred' }
        }
    }

    // Generic API methods
    async get<T>(endpoint: string, token: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' }, token)
    }

    async post<T>(endpoint: string, data: any, token: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        }, token)
    }

    async put<T>(endpoint: string, data: any, token: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        }, token)
    }

    async delete<T>(endpoint: string, token: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' }, token)
    }
}

export const apiClient = ApiClient.getInstance()

