import React, { useState } from 'react';
import { Pencil, Trash2, ArrowUpDown } from 'lucide-react';

interface Saving {
    id: string;
    description: string;
    amount: number;
    date: Date;
    isRecurring: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly';
}

interface SavingTableProps {
    savings: Saving[];
    onEdit: (saving: Saving) => void;
    onDelete: (id: string) => void;
}

type SortField = 'description' | 'amount' | 'date';
type SortDirection = 'asc' | 'desc';
interface SortConfig {
    field: SortField | null;
    direction: SortDirection;
}

const ITEMS_PER_PAGE = 10;

interface SortableHeaderProps {
    field: SortField;
    children: React.ReactNode;
    onSort: (field: SortField) => void;
    currentSort: SortConfig;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ field, children, onSort, currentSort }) => (
    <th
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
        onClick={() => onSort(field)}
    >
        <div className="flex items-center space-x-1">
            <span>{children}</span>
            <ArrowUpDown className={`h-4 w-4 ${currentSort.field === field ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
    </th>
);

export function SavingTable({ savings, onEdit, onDelete }: SavingTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'date', direction: 'desc' });

    const handleSort = (field: SortField) => {
        setSortConfig((prev) => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const sortedSavings = [...savings].sort((a, b) => {
        const dir = sortConfig.direction === 'asc' ? 1 : -1;
        switch (sortConfig.field) {
            case 'description':
                return a.description.localeCompare(b.description) * dir;
            case 'amount':
                return (a.amount - b.amount) * dir;
            case 'date':
                return (a.date.getTime() - b.date.getTime()) * dir;
            default:
                return 0;
        }
    });

    const totalPages = Math.ceil(sortedSavings.length / ITEMS_PER_PAGE);
    const paginatedSavings = sortedSavings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Saving History
            </h2>

            {savings.length > 0 ? (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                <tr>
                                    <SortableHeader field="description" onSort={handleSort} currentSort={sortConfig}>
                                        Description
                                    </SortableHeader>
                                    <SortableHeader field="amount" onSort={handleSort} currentSort={sortConfig}>
                                        Amount
                                    </SortableHeader>
                                    <SortableHeader field="date" onSort={handleSort} currentSort={sortConfig}>
                                        Date
                                    </SortableHeader>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedSavings.map((saving) => (
                                    <tr key={saving.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {saving.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            ${saving.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                            {new Date(saving.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => onEdit(saving)}
                                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(saving.id)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex justify-center items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Prev
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No savings added yet
                </div>
            )}
        </div>
    );
}
