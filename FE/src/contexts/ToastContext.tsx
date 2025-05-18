import { createContext, useContext, useState, ReactNode } from 'react'
import { Toast } from '../models/Toast'

interface ToastContextType {
    toasts: Toast[]
    addToast: (message: string, type?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = crypto.randomUUID()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id))
        }, 3000)
    }

    return (
        <ToastContext.Provider value={{ toasts, addToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[9999]">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className="flex items-center space-x-2 px-6 py-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 mb-2 slide-in"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-1 bg-green-100 dark:bg-green-900/50 rounded-full">
                                <svg
                                    className="h-5 w-5 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
} 