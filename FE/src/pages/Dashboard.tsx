import { Sun, Moon, DollarSign, Cog, LayoutDashboard, Home, PiggyBank, Menu, ShoppingCart } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useDarkMode from '../hooks/useDarkMode';
import { ExportCsvModal } from '../modals/ExportCsvModal';
import UnauthorizedPage from './UnauthorizedPage';
import { NavBar } from '../components/NavBar';
import { BudgetTab } from "./tabs/BudgetTab";
import { DashboardTab } from "./tabs/DashboardTab";
import { PiggyBankTab } from "./tabs/PiggyBankTab";
import { ExpensesTab } from "./tabs/ExpensesTab";
import { useTimePeriod } from '../contexts/TimePeriodContext';
import { SavingsTab } from './tabs/SavingsTab';
import { ChoresTab } from './tabs/ChoresTab';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth0 } from '@auth0/auth0-react';
import { useChores } from '../contexts/ChoresContext';
import { useGoodDeeds } from '../contexts/GoodDeedsContext';
import { fetchExpenses } from '../services/ExpenseApi';
import { useExpenses } from '../contexts/ExpenseContext';
import { useSavings } from '../contexts/SavingsContext';

type Tab = 'dashboard' | 'piggy-bank' | 'chores' | 'savings' | 'expenses' | 'budget';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>('piggy-bank');
  const { isAuthenticated, isLoading: isAuthLoading, logout } = useAuth0();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTabsOpen, setIsTabsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [dateFormat, setDateFormat] = useState<'dd-MM-yyyy' | 'yyyy-MM-dd'>('dd-MM-yyyy');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { selectedPeriod, currentMonth } = useTimePeriod();
  const { fetchChores } = useChores();
  const { fetchGoodDeed } = useGoodDeeds();
  const { fetchExpense } = useExpenses();
  const { fetchSaving } = useSavings();

  const openExportModal = () => {
    setIsSettingsOpen(false);
    setIsExportModalOpen(true);
  };

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      fetchChores()
      fetchGoodDeed()
      fetchExpense()
      fetchSaving()
    }
  }, [isAuthenticated, isAuthLoading])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const toggleTabs = () => {
    setIsTabsOpen(!isTabsOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (tabsRef.current && !tabsRef.current.contains(event.target as Node)) {
        setIsTabsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [settingsRef, tabsRef]);

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <UnauthorizedPage />;
  }

  const TabButton = ({ tab, icon: Icon, label }: { tab: Tab; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsTabsOpen(false);
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 sm:w-auto w-full text-left ${activeTab === tab
        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
        }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div>
      <NavBar />
      <div className="mt-16 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* --- Header --- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white"></h1>
              <div className="relative ml-auto sm:ml-0" ref={tabsRef}>
                <button
                  onClick={toggleTabs}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 sm:hidden"
                  aria-label="Toggle tabs"
                >
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                {isTabsOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-xl z-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="py-1">
                      <TabButton tab="piggy-bank" icon={PiggyBank} label="Piggy Bank" />
                      <TabButton tab="chores" icon={LayoutDashboard} label="Chores" />
                      <TabButton tab="savings" icon={DollarSign} label="Savings" />
                      <TabButton tab="expenses" icon={LayoutDashboard} label="Expenses" />
                      <TabButton tab="dashboard" icon={Home} label="Dashboard" />
                      <hr className="border-gray-200 dark:border-gray-700 my-1" />
                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center space-x-2 px-4 py-2 w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                      >
                        {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
                        <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </button>
                      <button
                        onClick={toggleSettings}
                        className="flex items-center space-x-2 px-4 py-2 w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Settings"
                      >
                        <Cog className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span>Settings</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
              </button>
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={toggleSettings}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  aria-label="Settings"
                >
                  <Cog className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-xl z-10 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="py-1">
                      <h6 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Data</h6>
                      <button
                        onClick={openExportModal}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- Main Content --- */}
          <div className="flex flex-col space-y-10">
            <div className="hidden sm:flex space-x-4">
              <TabButton tab="piggy-bank" icon={PiggyBank} label="Piggy Bank" />
              <TabButton tab="chores" icon={LayoutDashboard} label="Chores" />
              <TabButton tab="savings" icon={DollarSign} label="Savings" />
              <TabButton tab="expenses" icon={ShoppingCart} label="Expenses" />
              <TabButton tab="dashboard" icon={Home} label="Dashboard" />
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <DashboardTab
              dateFormat={dateFormat}
              selectedPeriod={selectedPeriod}
              currentMonth={currentMonth}
            />
          )}
          {activeTab === 'piggy-bank' && <PiggyBankTab />}
          {activeTab === 'chores' && <ChoresTab />}
          {activeTab === 'savings' && <SavingsTab dateFormat={dateFormat} />}
          {activeTab === 'expenses' && (
            <ExpensesTab
              dateFormat={dateFormat}
              selectedPeriod={selectedPeriod}
              currentMonth={currentMonth}
            />
          )}
          {activeTab === 'budget' && (
            <BudgetTab
              categories={[]}
              expenses={[]}
              onEditExpense={async () => { }}
              onDeleteExpense={async () => { }}
            />
          )}

          {/* Modals */}
          {isExportModalOpen && <ExportCsvModal onClose={() => setIsExportModalOpen(false)} />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;