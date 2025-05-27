import React, { useState } from 'react';
import { ArrowUpDown, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Expense } from '../models/Expense';
import { format } from 'date-fns';
import type { Category } from '../types/category';
import { EditExpenseModal } from './EditExpenseModal';

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

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  expense: Expense | null;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, expense }: DeleteConfirmationModalProps) {
  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Delete Expense
          </h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete this expense? This action cannot be undone.
        </p>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
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

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  dateFormat: string;
  categories: Category[];
  isLoading?: boolean;
}

// --- Constants ---
const ITEMS_PER_PAGE = 10;

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  onDelete,
  onEdit,
  dateFormat,
  categories,
  isLoading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: 'date',
    direction: 'desc',
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; expense: Expense | null }>({
    isOpen: false,
    expense: null
  });

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

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleSaveExpense = (updatedExpense: Expense) => {
    onEdit(updatedExpense);
    setEditingExpense(null);
  };

  const openDeleteModal = (expense: Expense) => {
    setDeleteModalState({ isOpen: true, expense });
  };

  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false, expense: null });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Expense History
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No expenses added yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Expense History
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <SortableHeader field="date" onSort={handleSort} currentSort={sortConfig}>
                Date
              </SortableHeader>
              <SortableHeader field="description" onSort={handleSort} currentSort={sortConfig}>
                Description
              </SortableHeader>
              <SortableHeader field="category" onSort={handleSort} currentSort={sortConfig}>
                Category
              </SortableHeader>
              <SortableHeader field="amount" onSort={handleSort} currentSort={sortConfig}>
                Amount
              </SortableHeader>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {format(new Date(expense.date), dateFormat)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div className="truncate" title={expense.description}>
                    {expense.description}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {expense.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  ${Math.abs(expense.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditExpense(expense)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(expense)}
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

      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          categories={categories}
          onClose={() => setEditingExpense(null)}
          onSave={handleSaveExpense}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => deleteModalState.expense && onDelete(deleteModalState.expense.id)}
        expense={deleteModalState.expense}
      />
    </div>
  );
}

export default ExpenseTable;
