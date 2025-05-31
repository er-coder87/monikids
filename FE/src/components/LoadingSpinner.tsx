export function LoadingSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-600 border-t-transparent"></div>
            </div>
        </div>
    );
} 