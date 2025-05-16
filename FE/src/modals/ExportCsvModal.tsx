import { Expense } from "../models/Expense";

export const ExportCsvModal = ({ onClose, expenses }: { onClose: () => void; expenses: Expense[] }) => {
    const handleExport = () => {
        if (expenses && expenses.length > 0) {
            const headers = ['Date', 'Description', 'Amount', 'Category'];
            const csvRows = [
                headers.join(','),
                ...expenses.map(expense => [
                    expense.date.toLocaleDateString(), // Format date based on user preference later
                    expense.description,
                    expense.amount.toFixed(2),
                    expense.category,
                ].join(',')),
            ];
            const csvData = csvRows.join('\n');
            const filename = 'expenses.csv';
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            onClose();
        } else {
            alert('No expenses to export.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Export Expenses to CSV</h2>
                <p className="mb-4 text-gray-700 dark:text-gray-300">Click the button below to export all your current expenses to a CSV file.</p>
                <div className="flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none mr-2">Cancel</button>
                    <button onClick={handleExport} className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none">Export</button>
                </div>
            </div>
        </div>
    );
};