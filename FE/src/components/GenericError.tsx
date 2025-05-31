import { AlertCircle, RefreshCw, Mail } from 'lucide-react'

interface GenericErrorProps {
    title?: string
    message?: string
    onRetry?: () => void
}

export function GenericError({
    title = "Something went wrong",
    message = "We're having trouble loading this page. Please try again.",
    onRetry
}: GenericErrorProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="flex flex-col items-center gap-6 p-8 max-w-md text-center">
                <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-full">
                    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                </div>

                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                )}

                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        If the problem persists, please contact our support team
                    </p>
                    <a
                        href="mailto:support@monikids.com"
                        className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                        <Mail className="w-4 h-4" />
                        support@monikids.com
                    </a>
                </div>
            </div>
        </div>
    )
}