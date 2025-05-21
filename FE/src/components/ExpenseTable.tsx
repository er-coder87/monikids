import React, { useState } from 'react';
import { ArrowUpDown, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Expense } from '../models/Expense';
import { format } from 'date-fns';
import type { Category } from '../types/category';
import { EditExpenseModal } from './EditExpenseModal';
import { EmptyState } from './EmptyState';

type SortField = 'date' | 'description' | 'category' | 'amount';
type SortDirection = 'asc' | 'desc';
interface SortConfig {
  field: SortField | null;
  direction: 'asc' | 'desc';
}

interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  onSort: (field: SortField) => void;
  currentSort: SortConfig;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ field, children, onSort, currentSort }) => (
  <div
    className="flex items-center space-x-1 cursor-pointer"
    onClick={() => onSort(field)}
  >
    <span>{children}</span>
    <ArrowUpDown className={`h-4 w-4 ${currentSort.field === field ? 'text-blue-500' : 'text-gray-400'}`} />
  </div>
);

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  dateFormat: string;
  categories: Category[];
}

// --- Constants ---
const ITEMS_PER_PAGE = 10;

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onDelete,
  onEdit,
  dateFormat,
  categories
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'date',
    direction: 'desc',
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const sortedExpenses = [...expenses].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    switch (sortConfig.field) {
      case 'date':
        return (a.date.getTime() - b.date.getTime()) * direction;
      case 'description':
        return a.description.localeCompare(b.description) * direction;
      case 'category':
        return ((a.category || '') || '').localeCompare((b.category || '') || '') * direction;
      case 'amount':
        return (a.amount - b.amount) * direction;
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = sortedExpenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Event Handlers ---
  const handleSort = (field: SortField) => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId((prevId) => (prevId === id ? null : id));
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setOpenMenuId(null);
  };

  const handleSaveExpense = (updatedExpense: Expense) => {
    onEdit(updatedExpense.id);
    setEditingExpense(null);
  };

  if (expenses.length > 0) {
    return <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="w-[15%] px-2 sm:px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortableHeader
                    field="date"
                    onSort={handleSort}
                    currentSort={sortConfig}
                  >
                    Date
                  </SortableHeader>
                </th>
                <th className="w-[35%] px-2 sm:px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortableHeader
                    field="description"
                    onSort={handleSort}
                    currentSort={sortConfig}
                  >
                    Description
                  </SortableHeader>
                </th>
                <th className="w-[20%] px-2 sm:px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortableHeader
                    field="category"
                    onSort={handleSort}
                    currentSort={sortConfig}
                  >
                    Category
                  </SortableHeader>
                </th>
                <th className="w-[15%] px-2 sm:px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <SortableHeader
                    field="amount"
                    onSort={handleSort}
                    currentSort={sortConfig}
                  >
                    Amount
                  </SortableHeader>
                </th>
                <th className="w-[15%] px-2 sm:px-4 py-2.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                    {format(new Date(expense.date), dateFormat)}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-sm text-gray-900 dark:text-gray-100 text-center">
                    <div className="truncate" title={expense.description}>
                      {expense.description}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                    {expense.category}
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                    <div className="relative inline-block">
                      <button
                        onClick={() => toggleMenu(expense.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </button>
                      {openMenuId === expense.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-700 shadow-lg rounded-lg overflow-hidden z-10 border border-gray-100 dark:border-gray-600 transform -translate-x-1/2 sm:translate-x-0">
                          <button
                            onClick={() => handleEditExpense(expense)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              onDelete(expense.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          categories={categories}
          onClose={() => setEditingExpense(null)}
          onSave={handleSaveExpense}
        />
      )}
    </div>
  }

  return <></>;
}

export default ExpenseTable;
