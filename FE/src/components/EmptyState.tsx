import { Receipt } from "lucide-react";

export const EmptyState = ({ title, message }: { title: string; message: string }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <Receipt className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
    </div>
)