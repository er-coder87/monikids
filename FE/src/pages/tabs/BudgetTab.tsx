import { useState, useEffect } from "react";
import { X, DollarSign, TrendingUp, AlertCircle, Trash2, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import type { Category } from "../../types/category";
import { TimePeriodSelector } from "../../components/TimePeriodSelector";
import { Expense } from "../../models/Expense";
import { useTimePeriod } from "../../contexts/TimePeriodContext";
import { EditExpenseModal } from "../../components/EditExpenseModal";

type BudgetPeriod = 'all' | 'monthly' | 'yearly';

interface Budget {
    id: string;
    name: string;
    categoryIds: string[];
    period: BudgetPeriod;
    plannedAmount: number;
    isOngoing: boolean;
    startDate: string | null;
    createdAt: string;
    lastUpdated: string;
}

interface BudgetStats {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    percentageUsed: number;
}

interface BudgetTabProps {
    categories: Category[];
    expenses: Expense[];
    onEditExpense?: (id: string) => void;
    onDeleteExpense?: (id: string) => void;
}

export function BudgetTab({ categories, expenses, onEditExpense, onDeleteExpense }: BudgetTabProps) {
    const { selectedPeriod, currentMonth } = useTimePeriod();
    const [budgets, setBudgets] = useState<Budget[]>(() => {
        const savedBudgets = localStorage.getItem('budgets');
        return savedBudgets ? JSON.parse(savedBudgets) : [];
    });
    const [isAddingBudget, setIsAddingBudget] = useState(false);
    const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
    const [newBudget, setNewBudget] = useState({
        name: '',
        categoryIds: [] as string[],
        period: 'monthly' as BudgetPeriod,
        plannedAmount: 0,
        isOngoing: true,
        startDate: new Date().toISOString().split('T')[0]
    });
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    useEffect(() => {
        localStorage.setItem('budgets', JSON.stringify(budgets));
    }, [budgets]);

    const calculateStats = (): BudgetStats => {
        const { start, end } = getDateRange();
        const currentYear = new Date(currentMonth).getFullYear();
        const currentMonthNum = new Date(currentMonth).getMonth();

        const filteredBudgets = budgets.filter(budget => {
            if (budget.period !== selectedPeriod) return false;

            // Include ongoing budgets
            if (budget.isOngoing) return true;

            // For non-ongoing budgets, check if they match the current period
            if (!budget.startDate) return false;

            const budgetDate = new Date(budget.startDate);
            const budgetYear = budgetDate.getFullYear();
            const budgetMonth = budgetDate.getMonth();

            if (selectedPeriod === 'monthly') {
                return budgetYear === currentYear && budgetMonth === currentMonthNum;
            } else if (selectedPeriod === 'yearly') {
                return budgetYear === currentYear;
            }

            return false;
        });

        const totalBudget = filteredBudgets.reduce((sum, budget) => sum + (budget.plannedAmount || 0), 0);

        // Calculate total spent for budgeted categories within the time period
        const totalSpent = filteredBudgets.reduce((sum, budget) => {
            const categoryExpenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                const category = categories.find(cat => cat.name === expense.category);
                return category &&
                    budget.categoryIds.includes(category.id) &&
                    expenseDate >= start &&
                    expenseDate <= end;
            });

            return sum + categoryExpenses.reduce((total, expense) => total + (expense.amount || 0), 0);
        }, 0);

        const remaining = totalBudget - totalSpent;
        const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        return {
            totalBudget: totalBudget || 0,
            totalSpent: totalSpent || 0,
            remaining: remaining || 0,
            percentageUsed: percentageUsed || 0
        };
    };

    const getDateRange = () => {
        const start = new Date(currentMonth);
        const end = new Date(currentMonth);

        switch (selectedPeriod) {
            case 'monthly':
                start.setDate(1);
                end.setMonth(end.getMonth() + 1);
                end.setDate(0);
                break;
            case 'yearly':
                start.setMonth(0);
                start.setDate(1);
                end.setMonth(11);
                end.setDate(31);
                break;
            default:
                // For 'all' period, use the entire year
                start.setMonth(0);
                start.setDate(1);
                end.setMonth(11);
                end.setDate(31);
        }

        return { start, end };
    };

    const calculateBudgetSpent = (categoryIds: string[]) => {
        const { start, end } = getDateRange();

        return expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                const category = categories.find(cat => cat.name === expense.category);
                return category &&
                    categoryIds.includes(category.id) &&
                    expenseDate >= start &&
                    expenseDate <= end;
            })
            .reduce((total, expense) => total + (expense.amount || 0), 0);
    };

    const getCategoryById = (id: string) => {
        return categories.find(category => category.id === id);
    };

    const getBudgetName = (categoryIds: string[]) => {
        if (categoryIds.length === 0) return 'General Budget';
        return categoryIds
            .map(id => getCategoryById(id)?.name)
            .filter(Boolean)
            .join(', ');
    };

    const addBudget = () => {
        if (newBudget.plannedAmount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        // Only check for category conflicts if categories are selected
        if (newBudget.categoryIds.length > 0) {
            const existingBudget = budgets.find(budget =>
                budget.period === newBudget.period &&
                budget.categoryIds.some(id => newBudget.categoryIds.includes(id)) &&
                (budget.isOngoing || (!budget.isOngoing && budget.startDate === newBudget.startDate))
            );

            if (existingBudget) {
                alert('One or more selected categories already have a budget for this period');
                return;
            }
        }

        const budget: Budget = {
            id: Date.now().toString(),
            name: newBudget.name || getBudgetName(newBudget.categoryIds),
            categoryIds: newBudget.categoryIds,
            period: newBudget.period,
            plannedAmount: newBudget.plannedAmount,
            isOngoing: newBudget.isOngoing,
            startDate: newBudget.isOngoing ? null : newBudget.startDate,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };

        setBudgets(prev => [...prev, budget]);
        setNewBudget({
            name: '',
            categoryIds: [],
            period: selectedPeriod,
            plannedAmount: 0,
            isOngoing: true,
            startDate: new Date().toISOString().split('T')[0]
        });
        setIsAddingBudget(false);
    };

    const deleteBudget = (id: string) => {
        setBudgets(prev => prev.filter(budget => budget.id !== id));
    };

    const startEditing = (budget: Budget) => {
        setEditingBudgetId(budget.id);
        setNewBudget({
            name: budget.name,
            categoryIds: budget.categoryIds,
            period: budget.period,
            plannedAmount: budget.plannedAmount,
            isOngoing: budget.isOngoing,
            startDate: budget.startDate || new Date().toISOString().split('T')[0]
        });
        setIsAddingBudget(true);
    };

    const cancelEditing = () => {
        setEditingBudgetId(null);
        setNewBudget({
            name: '',
            categoryIds: [],
            period: 'monthly',
            plannedAmount: 0,
            isOngoing: true,
            startDate: new Date().toISOString().split('T')[0]
        });
    };

    const updateBudget = () => {
        if (!editingBudgetId || newBudget.plannedAmount <= 0) return;

        setBudgets(prev => prev.map(budget =>
            budget.id === editingBudgetId
                ? {
                    ...budget,
                    name: newBudget.name || getBudgetName(newBudget.categoryIds),
                    categoryIds: newBudget.categoryIds,
                    period: newBudget.period,
                    plannedAmount: newBudget.plannedAmount,
                    isOngoing: newBudget.isOngoing,
                    startDate: newBudget.startDate,
                    lastUpdated: new Date().toISOString()
                }
                : budget
        ));

        setEditingBudgetId(null);
        setNewBudget({
            name: '',
            categoryIds: [],
            period: 'monthly',
            plannedAmount: 0,
            isOngoing: true,
            startDate: new Date().toISOString().split('T')[0]
        });
        setIsAddingBudget(false);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
    };

    const handleSaveExpense = (updatedExpense: Expense) => {
        if (onEditExpense) {
            onEditExpense(updatedExpense.id);
        }
        setEditingExpense(null);
    };

    const toggleCategory = (categoryId: string) => {
        setNewBudget(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId]
        }));
    };

    const stats = calculateStats();

    return (
        <div className="space-y-10">
            {/* Time Period Selector */}
            <div className="flex justify-start">
                <TimePeriodSelector
                    dateFormat="yyyy-MM-dd"
                />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                ${(stats?.totalBudget ?? 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                ${(stats?.totalSpent ?? 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining</p>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                ${(stats?.remaining ?? 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Budget Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Budget</h2>
                    </div>
                    <button
                        onClick={() => setIsAddingBudget(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Add Budget
                    </button>
                </div>

                {isAddingBudget && (
                    <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingBudgetId ? 'Edit Budget' : 'Create New Budget'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsAddingBudget(false);
                                    if (editingBudgetId) cancelEditing();
                                }}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (editingBudgetId) {
                                updateBudget();
                            } else {
                                addBudget();
                            }
                        }} className="space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Budget Name
                                    </label>
                                    <input
                                        type="text"
                                        value={newBudget.name}
                                        onChange={(e) => setNewBudget({ ...newBudget, name: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                        placeholder="Enter budget name (optional)"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Leave empty to use category names
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Categories (Optional)
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {categories
                                            .filter(category => !budgets.some(budget =>
                                                budget.period === newBudget.period &&
                                                budget.categoryIds.includes(category.id)
                                            ))
                                            .map((category) => (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    onClick={() => toggleCategory(category.id)}
                                                    className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${newBudget.categoryIds.includes(category.id)
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-200 dark:border-indigo-700'
                                                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: category.color }}
                                                        />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {category.name}
                                                        </span>
                                                    </div>
                                                    {newBudget.categoryIds.includes(category.id) ? (
                                                        <Minus className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <Plus className="h-4 w-4 text-gray-400" />
                                                    )}
                                                </button>
                                            ))}
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Select categories to track specific spending, or leave empty for a general budget
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Budget Period
                                        </label>
                                        <select
                                            value={newBudget.period}
                                            onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as BudgetPeriod })}
                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                            required
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                            <option value="all">All Time</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Planned Amount
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
                                            <input
                                                type="number"
                                                value={newBudget.plannedAmount || ''}
                                                onChange={(e) => setNewBudget({ ...newBudget, plannedAmount: Number(e.target.value) })}
                                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 pl-8 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                                placeholder="0.00"
                                                min="0"
                                                step="0.01"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isOngoing"
                                            checked={newBudget.isOngoing}
                                            onChange={(e) => setNewBudget({ ...newBudget, isOngoing: e.target.checked })}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isOngoing" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                            This is an ongoing budget
                                        </label>
                                    </div>

                                    {!newBudget.isOngoing && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {newBudget.period === 'monthly' && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Month
                                                        </label>
                                                        <select
                                                            value={new Date(newBudget.startDate).getMonth()}
                                                            onChange={(e) => {
                                                                const date = new Date(newBudget.startDate);
                                                                date.setMonth(Number(e.target.value));
                                                                setNewBudget({ ...newBudget, startDate: date.toISOString().split('T')[0] });
                                                            }}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                                        >
                                                            {Array.from({ length: 12 }, (_, i) => (
                                                                <option key={i} value={i}>
                                                                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Year
                                                        </label>
                                                        <select
                                                            value={new Date(newBudget.startDate).getFullYear()}
                                                            onChange={(e) => {
                                                                const date = new Date(newBudget.startDate);
                                                                date.setFullYear(Number(e.target.value));
                                                                setNewBudget({ ...newBudget, startDate: date.toISOString().split('T')[0] });
                                                            }}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                                        >
                                                            {Array.from({ length: 5 }, (_, i) => {
                                                                const year = new Date().getFullYear() + i;
                                                                return (
                                                                    <option key={year} value={year}>
                                                                        {year}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>
                                                    </div>
                                                </>
                                            )}
                                            {newBudget.period === 'yearly' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Year
                                                    </label>
                                                    <select
                                                        value={new Date(newBudget.startDate).getFullYear()}
                                                        onChange={(e) => {
                                                            const date = new Date(newBudget.startDate);
                                                            date.setFullYear(Number(e.target.value));
                                                            setNewBudget({ ...newBudget, startDate: date.toISOString().split('T')[0] });
                                                        }}
                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                                    >
                                                        {Array.from({ length: 5 }, (_, i) => {
                                                            const year = new Date().getFullYear() + i;
                                                            return (
                                                                <option key={year} value={year}>
                                                                    {year}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddingBudget(false);
                                        if (editingBudgetId) cancelEditing();
                                    }}
                                    className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    {editingBudgetId ? 'Update Budget' : 'Create Budget'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Budget Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {budgets
                        .filter(budget => {
                            if (budget.period !== selectedPeriod) return false;

                            // Include ongoing budgets
                            if (budget.isOngoing) return true;

                            // For non-ongoing budgets, check if they match the current period
                            if (!budget.startDate) return false;

                            const budgetDate = new Date(budget.startDate);
                            const budgetYear = budgetDate.getFullYear();
                            const budgetMonth = budgetDate.getMonth();
                            const currentYear = new Date(currentMonth).getFullYear();
                            const currentMonthNum = new Date(currentMonth).getMonth();

                            if (selectedPeriod === 'monthly') {
                                return budgetYear === currentYear && budgetMonth === currentMonthNum;
                            } else if (selectedPeriod === 'yearly') {
                                return budgetYear === currentYear;
                            }

                            return false;
                        })
                        .map((budget) => {
                            const spent = calculateBudgetSpent(budget.categoryIds) || 0;
                            const plannedAmount = budget.plannedAmount || 0;
                            const percentage = plannedAmount > 0 ? (spent / plannedAmount) * 100 : 0;
                            const isOverBudget = spent > plannedAmount;

                            return (
                                <div
                                    key={budget.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {budget.name}
                                                </h3>
                                                {budget.isOngoing ? (
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-full">
                                                        Ongoing
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full">
                                                        {budget.period === 'monthly'
                                                            ? format(new Date(budget.startDate!), 'MMM yyyy')
                                                            : format(new Date(budget.startDate!), 'yyyy')}
                                                    </span>
                                                )}
                                            </div>
                                            {budget.categoryIds.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {budget.categoryIds.map(categoryId => {
                                                        const category = getCategoryById(categoryId);
                                                        return category ? (
                                                            <div
                                                                key={categoryId}
                                                                className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                                                            >
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: category.color }}
                                                                />
                                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                    {category.name}
                                                                </span>
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => startEditing(budget)}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                            >
                                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => deleteBudget(budget.id)}
                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                            >
                                                <Trash2 className="h-5 w-5 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-300">
                                                ${spent.toFixed(2)} spent
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-300">
                                                ${plannedAmount.toFixed(2)} planned
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${isOverBudget
                                                    ? 'bg-red-500'
                                                    : percentage > 80
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-sm">
                                            <span className={`${isOverBudget ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                                {isOverBudget
                                                    ? `Over by $${(spent - plannedAmount).toFixed(2)}`
                                                    : `Remaining: $${(plannedAmount - spent).toFixed(2)}`
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </div>

            {/* Unbudgeted Expenses Card */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Unbudgeted Expenses</h2>

                {(() => {
                    const { start, end } = getDateRange();
                    const budgetedCategoryIds = budgets
                        .filter(budget => budget.period === selectedPeriod)
                        .flatMap(budget => budget.categoryIds);

                    const unbudgetedExpenses = expenses.filter(expense => {
                        const expenseDate = new Date(expense.date);
                        const category = categories.find(cat => cat.name === expense.category);
                        return expenseDate >= start &&
                            expenseDate <= end &&
                            category &&
                            !budgetedCategoryIds.includes(category.id);
                    });

                    if (unbudgetedExpenses.length === 0) {
                        return (
                            <p className="text-gray-500 dark:text-gray-400">
                                All expenses are currently budgeted.
                            </p>
                        );
                    }

                    const totalUnbudgeted = unbudgetedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

                    return (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Total Unbudgeted: ${totalUnbudgeted.toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    {unbudgetedExpenses.length} {unbudgetedExpenses.length === 1 ? 'expense' : 'expenses'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {unbudgetedExpenses.map((expense, index) => {
                                    const category = categories.find(cat => cat.name === expense.category);
                                    return (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex flex-col">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: category?.color || '#6B7280' }}
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-300">
                                                        {expense.category}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {expense.description}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <div className="text-gray-900 dark:text-white font-medium">
                                                        ${expense.amount.toFixed(2)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {format(new Date(expense.date), 'MMM d, yyyy')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditExpense(expense)}
                                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                    >
                                                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteExpense?.(expense.id)}
                                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                    >
                                                        <Trash2 className="h-5 w-5 text-gray-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })()}
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
    );
} 