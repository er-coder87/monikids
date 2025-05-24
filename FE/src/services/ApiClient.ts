import { getCookie, setCookie, deleteCookie } from 'cookies-next'

const API_URL = import.meta.env.VITE_API_URL

interface ApiResponse<T> {
    data?: T
    error?: string
}

class ApiClient {
    private static instance: ApiClient
    private csrfToken: string | null = null

    private constructor() {
        // Initialize CSRF token
        this.csrfToken = getCookie('XSRF-TOKEN') as string
    }

    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient()
        }
        return ApiClient.instance
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const headers = new Headers({
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {})
        })

        // Add CSRF token if available
        if (this.csrfToken) {
            headers.set('X-XSRF-TOKEN', this.csrfToken)
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include', // Important for cookies
            })

            // Update CSRF token if provided in response
            const newCsrfToken = response.headers.get('X-XSRF-TOKEN')
            if (newCsrfToken) {
                this.csrfToken = newCsrfToken
                setCookie('XSRF-TOKEN', newCsrfToken, {
                    httpOnly: true,
                    secure: import.meta.env.PROD,
                    sameSite: 'strict'
                })
            }

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

    // Auth methods
    async login<T>(email: string, password: string): Promise<ApiResponse<T>> {
        return this.request<T>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        })
    }

    async logout(): Promise<ApiResponse<void>> {
        this.csrfToken = null
        return this.request<void>('/auth/logout', { method: 'POST' })
    }

    async validateToken<T>(): Promise<ApiResponse<T>> {
        return this.request<T>('/auth/validate-token', { method: 'POST' })
    }

    // Generic API methods
    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' })
    }

    async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        })
    }

    async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' })
    }
}

export const apiClient = ApiClient.getInstance() 