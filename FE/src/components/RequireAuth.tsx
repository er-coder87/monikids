import { useAuth0 } from '@auth0/auth0-react'
import { Navigate, useLocation, useOutlet } from 'react-router-dom'
import { LoadingSpinner } from './LoadingSpinner'

export function RequireAuth() {
    const { isAuthenticated, isLoading, error } = useAuth0()
    const location = useLocation()
    const outlet = useOutlet()

    if (isLoading) return <LoadingSpinner />

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="text-red-600 dark:text-red-400 mb-4">
                    {error.message || 'An error occurred while checking authentication'}
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return outlet
}