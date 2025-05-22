import { useState } from "react";
import { Expense } from "../models/Expense";

export const ImportCsvModal = ({ onClose }: { onClose: () => void; }) => {
    const [csvFile, setCsvFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setCsvFile(event.target.files[0]);
        }
    };

    const handleImport = () => {
        if (csvFile) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const csvData = e.target?.result as string;
                const parsedExpenses = parseCsvData(csvData);
                onClose();
            };
            reader.readAsText(csvFile);
        } else {
            alert('Please select a CSV file to import.');
        }
    };

    const parseCsvData = (csvText: string): Expense[] => {
        const lines = csvText.trim().split('\n').map(line => line.split(','));
        if (lines.length <= 1) {
            return []; // No data rows
        }

        const headers = lines[0].map(header => header.trim().toLowerCase()); // Normalize headers
        const dataRows = lines.slice(1);
        const parsed: Expense[] = [];

        dataRows.forEach(row => {
            if (row.length === headers.length) {
                const expense: Partial<Expense> = {};
                headers.forEach((header, index) => {
                    const value = row[index]?.trim();
                    switch (header) {
                        case 'date':
                            // Try different date formats for parsing
                            const parsedDate1 = new Date(value);
                            const parsedDate2 = new Date(value.replace(/\./g, '/')); // Handle '2024. 3. 1.'
                            expense.date = !isNaN(parsedDate1.getTime()) ? parsedDate1 : (!isNaN(parsedDate2.getTime()) ? parsedDate2 : undefined);
                            break;
                        case 'description':
                            expense.description = value;
                            break;
                        case 'amount':
                            expense.amount = parseFloat(value);
                            break;
                        case 'category':
                            expense.category = value;
                            break;
                        default:
                            // Ignore unknown columns
                            break;
                    }
                });

                // Validate that essential fields are parsed
                if (expense.date && expense.description && !isNaN(expense.amount || 0) && expense.category) {
                    parsed.push({
                        id: Math.random().toString(36).substring(2, 15), // Generate a random ID
                        date: expense.date,
                        description: expense.description,
                        amount: expense.amount,
                        category: expense.category,
                    } as Expense);
                } else {
                    console.warn('Skipping invalid CSV row:', row);
                }
            } else {
                console.warn('Skipping CSV row with incorrect number of columns:', row);
            }
        });

        return parsed;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Import Expenses from CSV</h2>
                <input type="file" accept=".csv" onChange={handleFileChange} className="mb-4" />
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none">Cancel</button>
                    <button onClick={handleImport} className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 focus:outline-none">Import</button>
                </div>
            </div>
        </div>
    );
};