import { Sun, Moon, DollarSign, Cog, StickyNote, LayoutDashboard } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import AddExpenseForm from '../components/AddExpenseForm';
import FileUpload from '../components/FileUpload';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseTrendChart from '../components/ExpenseTrendChart';
import ExpenseCategoryChart from '../components/ExpenseCategoryChart';
import useDarkMode from '../hooks/useDarkMode';
import useFetchExpenses from '../hooks/useFetchExpenses';
import { ExportCsvModal } from '../modals/ExportCsvModal';
import { ImportCsvModal } from '../modals/ImportCsvModal';
import { Expense } from '../models/Expense';
import { CreateExpense } from '../services/CreateExpense';
import { addExpense, deleteExpense } from '../services/ExpenseApi';
import { getAmountAtTimeData, getAccumulatedAmountData } from '../utilities/expenseUtils';
import UnauthorizedPage from './UnauthorizedPage';
import { NavBar } from '../components/NavBar';
import { endOfMonth, isWithinInterval, startOfMonth, endOfYear, startOfYear } from 'date-fns';
import { TimePeriodSelector } from '../components/TimePeriodSelector';
import { NotesTab } from './tabs/NotesTab';
import { CategoryManager } from '../components/CategoryManager';
import type { Category } from '../types/category';
import { BudgetTab } from "./tabs/BudgetTab";
import { useTimePeriod } from '../contexts/TimePeriodContext';

type Tab = 'expenses' | 'notes' | 'reminders' | 'budget'

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Utilities', color: '#3B82F6' },
  { id: '2', name: 'Food', color: '#10B981' },
  { id: '3', name: 'Transportation', color: '#F59E0B' },
  { id: '4', name: 'Entertainment', color: '#8B5CF6' },
  { id: '5', name: 'Health', color: '#EF4444' },
  { id: '6', name: 'Education', color: '#EC4899' },
  { id: '7', name: 'Other', color: '#6B7280' },
]

interface Goal {
  monthly: number;
  yearly: number;
}

const Dashboard = () => {
  // --- State Variables ---
  const [activeTab, setActiveTab] = useState<Tab>('expenses')
  const { isAuthenticated, logout } = useUser();
  const { fetchedExpenses, refetch } = useFetchExpenses();
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amountAtTimeChartData, setAmountAtTimeChartData] = useState(getAmountAtTimeData(expenses));
  const [accumulatedAmountChartData, setAccumulatedAmountChartData] = useState(getAccumulatedAmountData(expenses));
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [dateFormat, setDateFormat] = useState<'dd-MM-yyyy' | 'yyyy-MM-dd'>('yyyy-MM-dd');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const { selectedPeriod, currentMonth } = useTimePeriod();

  const navigate = useNavigate();

  const handleDateFormatChange = (format: 'dd-MM-yyyy' | 'yyyy-MM-dd') => {
    setDateFormat(format);
    setIsSettingsOpen(false);
  };

  const openImportModal = () => {
    setIsSettingsOpen(false);
    setIsImportModalOpen(true);
  };

  const openExportModal = () => {
    setIsSettingsOpen(false);
    setIsExportModalOpen(true);
  };

  const handleAddExpense = async (newExpenseData: CreateExpense) => {
    try {
      const response = await addExpense(newExpenseData); // Call your API to add the expense
      if (response) {
        // Assuming your API returns the newly created expense with an ID and date
        setAllExpenses((prevExpenses) => [...prevExpenses, response]);
        refetch(); // Reload data to ensure consistency
      } else {
        console.error('Failed to add expense.');
        // Optionally show an error message to the user
      }
    } catch (error: any) {
      console.error('Error adding expense:', error.message);
      // Optionally show an error message
    }
  };

  const handleEditExpense = async (id: string) => {
    try {
      // Find the expense to edit
      const expenseToEdit = allExpenses.find(expense => expense.id === id);
      if (!expenseToEdit) {
        console.error('Expense not found');
        return;
      }

      // Update the expense in the state
      setAllExpenses(prevExpenses =>
        prevExpenses.map(expense =>
          expense.id === id ? expenseToEdit : expense
        )
      );

      // Refetch to ensure consistency
      await refetch();
    } catch (error: any) {
      console.error('Error editing expense:', error.message);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id); // Call your API to delete the expense
      setAllExpenses((prevExpenses) => prevExpenses.filter((expense) => expense.id !== id));
      refetch(); // Reload data after deletion
    } catch (error: any) {
      console.error('Error deleting expense:', error.message);
      // Optionally show an error message
    }
  };

  const handleExpensesUploaded = (newExpenses: Expense[]) => {
    setAllExpenses((prevExpenses) => [...prevExpenses, ...newExpenses]);
  };

  const handleExpensesImported = (newExpenses: Expense[]) => {
    setAllExpenses((prevExpenses) => [...prevExpenses, ...newExpenses]);
    // You might want to also send these to your API
  };

  const handleCategoryCreated = (category: Category) => {
    setCategories(prev => [...prev, category])
  }

  const getDateRange = () => {
    switch (selectedPeriod) {
      case 'monthly':
        return [startOfMonth(currentMonth), endOfMonth(currentMonth)]
      case 'yearly':
        return [startOfYear(currentMonth), endOfYear(currentMonth)]
      case 'all':
      default:
        return [null, null]
    }
  }

  // --- Effects ---
  useEffect(() => {
    if (fetchedExpenses) {
      setAllExpenses(fetchedExpenses);
    }
  }, [fetchedExpenses]);

  useEffect(() => {
    let filteredExpenses = [...allExpenses];

    switch (selectedPeriod) {
      case 'monthly':
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        filteredExpenses = allExpenses.filter(expense => {
          const date = new Date(expense.date);
          return date >= monthStart && date <= monthEnd;
        });
        break;
      case 'yearly':
        const yearStart = startOfYear(currentMonth);
        const yearEnd = endOfYear(currentMonth);
        filteredExpenses = allExpenses.filter(expense => {
          const date = new Date(expense.date);
          return date >= yearStart && date <= yearEnd;
        });
        break;
      case 'all':
      default:
        break;
    }
    setExpenses(filteredExpenses);
  }, [allExpenses, selectedPeriod, currentMonth]);

  useEffect(() => {
    setAmountAtTimeChartData(getAmountAtTimeData(expenses));
    setAccumulatedAmountChartData(getAccumulatedAmountData(expenses));
  }, [expenses]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // --- Computed Properties ---
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Close the settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsRef]);

  // --- JSX ---
  if (!isAuthenticated) {
    return <UnauthorizedPage />;
  }

  const TabButton = ({ tab, icon: Icon, label }: { tab: Tab; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${activeTab === tab
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  )

  const renderExpenses = () => (
    <div className='flex flex-col space-y-4'>
      <div className='flex justify-start'>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 w-fit">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  ({expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'})
                </span>
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">${totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        {/* --- Charts --- */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <ExpenseTrendChart
            amountAtTimeChartData={amountAtTimeChartData}
            accumulatedAmountChartData={accumulatedAmountChartData}
            dateFormat={dateFormat}
            selectedPeriod={selectedPeriod}
            currentMonth={currentMonth}
          />
          <ExpenseCategoryChart
            expenses={expenses}
          />
        </div>

        {/* --- Forms and Upload --- */}
        <div className="space-y-4">
          <AddExpenseForm onAddExpense={handleAddExpense} />
          <CategoryManager
            onCategoryCreated={handleCategoryCreated}
            existingCategories={categories}
          />
          <FileUpload onExpensesUploaded={handleExpensesUploaded} />
        </div>
      </div>

      {/* --- Expense Table --- */}
      <ExpenseTable
        expenses={expenses}
        onDelete={handleDeleteExpense}
        onEdit={handleEditExpense}
        dateFormat={dateFormat}
        categories={categories}
      />
    </div>
  )

  return (
    <div>
      <NavBar />
      <div className="mt-16 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* --- Header --- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white"></h1>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
              <div className="relative">
                <button
                  onClick={toggleSettings}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label="Settings"
                >
                  <Cog className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                {isSettingsOpen && (
                  <div ref={settingsRef} className="absolute right-0 mt-2 w-48 rounded-md shadow-xl z-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="py-1">
                      <h6 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date Format</h6>
                      <button
                        onClick={() => handleDateFormatChange('dd-MM-yyyy')}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${dateFormat === 'dd-MM-yyyy' ? 'font-semibold' : ''}`}
                      >
                        DD-MM-YYYY
                      </button>
                      <button
                        onClick={() => handleDateFormatChange('yyyy-MM-dd')}
                        className={`block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 ${dateFormat === 'yyyy-MM-dd' ? 'font-semibold' : ''}`}
                      >
                        YYYY-MM-DD
                      </button>
                      <hr className="border-gray-200 dark:border-gray-700 my-1" />
                      <h6 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Data</h6>
                      <button
                        onClick={openImportModal}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        Import CSV
                      </button>
                      <button
                        onClick={openExportModal}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        Export CSV
                      </button>
                      <hr className="border-gray-200 dark:border-gray-700 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          navigate('/login'); // Redirect to login after logout
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- Main Content --- */}
          <div className="flex flex-col space-y-10">
            <div className="flex space-x-4">
              <TabButton tab="expenses" icon={LayoutDashboard} label="Expenses" />
              <TabButton tab="budget" icon={DollarSign} label="Budget" />
              <TabButton tab="notes" icon={StickyNote} label="Notes" />
            </div>

            {activeTab === 'expenses' && (
              <div className="flex justify-start">
                <TimePeriodSelector dateFormat={dateFormat} />
              </div>
            )}
          </div>

          {activeTab === 'expenses' && renderExpenses()}
          {activeTab === 'notes' && <NotesTab />}
          {activeTab === 'budget' && (
            <BudgetTab
              categories={categories}
              expenses={expenses}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {/* Modals */}
          {isImportModalOpen && <ImportCsvModal onClose={() => setIsImportModalOpen(false)} onExpensesImported={handleExpensesImported} />}
          {isExportModalOpen && <ExportCsvModal onClose={() => setIsExportModalOpen(false)} expenses={allExpenses} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;