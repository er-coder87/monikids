import { useState, useEffect } from 'react'
import { DollarSign, Calendar, ListChecks, Trash2, PiggyBank, Heart, CheckCircle2, Pencil, Check } from 'lucide-react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { EditSavingModal } from '../../components/EditSavingModal'
import { SavingTable } from '../../components/SavingTable'

interface PiggyBankTransaction {
    description: string
    amount: number
    date: Date
    isRecurring: boolean
    recurringFrequency?: 'daily' | 'weekly' | 'monthly'
}

interface Chore {
    id: string
    description: string
    frequency: number
    savingAmount: number
    completedCount: number
    savingAdded?: boolean
}

interface GoodDeed {
    stamps: number
    maxStamps: number
}

interface PiggyBankTabProps {
    dateFormat: 'dd-MM-yyyy' | 'yyyy-MM-dd'
}

interface Toast {
    id: string
    message: string
    type: 'success' | 'error'
}

interface Saving {
    id: string
    description: string
    amount: number
    date: Date
    isRecurring: boolean
    recurringFrequency?: 'daily' | 'weekly' | 'monthly'
}

export function PiggyBankTab({ dateFormat }: PiggyBankTabProps) {
    const [formData, setFormData] = useState<PiggyBankTransaction>({
        description: '',
        amount: 0,
        date: new Date(),
        isRecurring: false,
        recurringFrequency: 'monthly'
    })

    const [choreData, setChoreData] = useState<Omit<Chore, 'id' | 'completedCount'>>({
        description: '',
        frequency: 1,
        savingAmount: 0
    })

    const [chores, setChores] = useState<Chore[]>([])
    const [goodDeed, setGoodDeed] = useState<GoodDeed>({
        stamps: 0,
        maxStamps: 10,
    })
    const [totalSavings, setTotalSavings] = useState(0)
    const [toasts, setToasts] = useState<Toast[]>([])
    const [savings, setSavings] = useState<Saving[]>([])
    const [editingSaving, setEditingSaving] = useState<Saving | null>(null)

    const handleSavingSubmit = async (transaction: PiggyBankTransaction) => {
        if (editingSaving) {
            setSavings(prev => prev.map(a =>
                a.id === editingSaving.id ? { ...transaction, id: a.id } : a
            ))
            setEditingSaving(null)
        } else {
            setSavings(prev => [...prev, { ...transaction, id: crypto.randomUUID() }])
        }
        setTotalSavings(prev => prev + transaction.amount)
        setFormData({
            description: '',
            amount: 0,
            date: new Date(),
            isRecurring: false,
            recurringFrequency: 'monthly'
        })

        addToast(`Added $${transaction.amount.toFixed(2)} for ${transaction.description}`)
    }

    const handleChoreSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const newChore: Chore = {
            id: crypto.randomUUID(),
            ...choreData,
            completedCount: 0
        }

        setChores(prev => [...prev, newChore])

        setChoreData({
            description: '',
            frequency: 1,
            savingAmount: 0
        })

        console.log('Chore submitted:', newChore)
    }

    const handleCompleteChore = (choreId: string) => {
        setChores(prev => prev.map(chore => {
            if (chore.id === choreId) {
                const newCompletedCount = chore.completedCount + 1
                if (newCompletedCount >= chore.frequency) {
                    const today = new Date()
                    const formattedDate = today.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                    setFormData(prev => ({
                        ...prev,
                        description: `${chore.description} ${formattedDate}`,
                        amount: chore.savingAmount,
                        date: today
                    }))
                }
                return { ...chore, completedCount: newCompletedCount }
            }
            return chore
        }))
    }

    const handleAddSaving = (chore: Chore) => {
        const today = new Date()
        const formattedDate = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
        const transaction: PiggyBankTransaction = {
            description: `${chore.description} ${formattedDate}`,
            amount: chore.savingAmount,
            date: today,
            isRecurring: false,
            recurringFrequency: 'monthly'
        }
        handleSavingSubmit(transaction)
        setChores(prev => prev.map(c =>
            c.id === chore.id ? { ...c, savingAdded: true } : c
        ))
    }

    const handleEditSaving = (saving: Saving) => {
        setEditingSaving(saving)
    }

    const handleSaveSaving = (updatedSaving: Saving) => {
        setSavings(prev => prev.map(a =>
            a.id === updatedSaving.id ? updatedSaving : a
        ))
        setEditingSaving(null)
    }

    const handleDeleteSaving = (id: string) => {
        const saving = savings.find(a => a.id === id)
        if (saving) {
            setTotalSavings(prev => prev - saving.amount)
            setSavings(prev => prev.filter(a => a.id !== id))
        }
    }

    const handleSetStamps = (newCount: number) => {
        setGoodDeed(prev => ({
            ...prev,
            stamps: Math.min(newCount, prev.maxStamps),
        }))
    }

    const handleMaxStampsChange = (value: number) => {
        setGoodDeed(prev => ({
            ...prev,
            maxStamps: value,
            stamps: Math.min(prev.stamps, value) // Ensure stamps don't exceed new max
        }))
    }

    const addToast = (message: string, type: 'success' | 'error' = 'success') => {
        const id = crypto.randomUUID()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id))
        }, 3000)
    }

    const handleDeleteChore = (choreId: string) => {
        setChores(prev => prev.filter(chore => chore.id !== choreId))
        // TODO: Implement API call to delete chore
    }

    const handleDeleteByCompletionChore = (choreId: string) => {
        setChores(prev => prev.filter(chore => chore.id !== choreId))

        addToast(`Completed house chore`)
    }

    return (
        <div className="space-y-6">
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[9999]">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className="flex items-center space-x-2 px-6 py-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 mb-2 slide-in"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-1 bg-green-100 dark:bg-green-900/50 rounded-full">
                                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-base font-medium text-gray-900 dark:text-white">
                                {toast.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-gray-100/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Good Deeds</h2>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {goodDeed.stamps} / {goodDeed.maxStamps}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-gray-100/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <ListChecks className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Chores Completed</h2>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {(chores.filter(chore => chore.completedCount >= chore.frequency).length)} / {chores.length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-gray-100/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <PiggyBank className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Savings</h2>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                ${totalSavings.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Good Deeds
                </h2>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="maxStamps" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Maximum Stamps
                        </label>
                        <select
                            id="maxStamps"
                            value={goodDeed.maxStamps}
                            onChange={(e) => handleMaxStampsChange(Number(e.target.value))}
                            className="ml-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            {[10, 15, 20, 25, 30].map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Choose how many good deeds are needed for a surprise
                    </p>

                    <div className="flex flex-col items-center space-y-4">
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-w-[500px] w-full">
                            {[...Array(goodDeed.maxStamps)].map((_, index) => {
                                const isStamped = index < goodDeed.stamps;

                                return (
                                    <button
                                        type="button"
                                        key={index}
                                        aria-label={`Stamp ${index + 1}`}
                                        className={`aspect-square w-full rounded-full border-2 flex items-center justify-center cursor-pointer transform transition-transform duration-150 hover:scale-110
                                            ${isStamped ? 'bg-yellow-400 border-yellow-500' : 'border-gray-300 dark:border-gray-600'}`}
                                        onClick={() => handleSetStamps(isStamped && index === goodDeed.stamps - 1 ? index : index + 1)}
                                    >
                                        {isStamped && (
                                            <svg
                                                className="w-[70%] h-[70%]"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <circle cx="12" cy="12" r="10" fill="#FFD700" />
                                                <circle cx="8" cy="10" r="1.5" fill="#000" />
                                                <circle cx="16" cy="10" r="1.5" fill="#000" />
                                                <circle cx="6" cy="12" r="2" fill="#FF6B6B" />
                                                <circle cx="18" cy="12" r="2" fill="#FF6B6B" />
                                                <path d="M10 15C10 15 12 17 14 15" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M7 5L5 2L7 4" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
                                                <path d="M17 5L19 2L17 4" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <ListChecks className="h-5 w-5 mr-2" />
                        House Chores
                    </h2>
                </div>
                <form onSubmit={handleChoreSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label htmlFor="choreDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Chore Description
                            </label>
                            <input
                                type="text"
                                id="choreDescription"
                                value={choreData.description}
                                onChange={(e) => setChoreData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Times to Complete
                            </label>
                            <input
                                type="number"
                                id="frequency"
                                value={choreData.frequency}
                                onChange={(e) => setChoreData(prev => ({ ...prev, frequency: parseInt(e.target.value) }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                                min="1"
                            />
                        </div>

                        <div>
                            <label htmlFor="choreSaving" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Saving Amount
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    id="choreSaving"
                                    value={choreData.savingAmount}
                                    onChange={(e) => setChoreData(prev => ({ ...prev, savingAmount: parseFloat(e.target.value) }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex">
                        <button
                            type="submit"
                            className="w-full md:w-1/4 py-2 px-4 rounded-md text-sm font-medium transition-colors
                                bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add
                        </button>
                    </div>
                </form>

                {chores.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Current Chores</h3>
                        <div className="space-y-3">
                            {chores.map(chore => (
                                <div key={chore.id} className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-gray-900 dark:text-white">{chore.description}</p>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                ${chore.savingAmount.toFixed(2)}
                                            </span>
                                            {chore.completedCount >= chore.frequency ? (
                                                chore.savingAdded ? (
                                                    <button
                                                        onClick={() => handleDeleteByCompletionChore(chore.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddSaving(chore)}
                                                        className="p-1.5 text-green-600 hover:text-green-700 transition-colors rounded-full hover:bg-green-100 dark:hover:bg-green-900/30"
                                                    >
                                                        <DollarSign className="h-4 w-4" />
                                                    </button>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteChore(chore.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Progress: {chore.completedCount}/{chore.frequency}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {Math.round((chore.completedCount / chore.frequency) * 100)}%
                                            </span>
                                        </div>

                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${(chore.completedCount / chore.frequency) * 100}%`,
                                                    backgroundColor: chore.completedCount >= chore.frequency ? '#059669' : '#2563eb'
                                                }}
                                            />
                                        </div>

                                        {chore.completedCount >= chore.frequency ? <></> :
                                            <div className="flex">
                                                <button
                                                    onClick={() => handleCompleteChore(chore.id)}
                                                    className={`w-full md:w-1/4 py-2 px-4 rounded-md text-sm font-medium transition-colors
                                                        bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                                >
                                                    I Did It!
                                                </button>
                                            </div>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Add Saving
                </h2>

                <form onSubmit={(e) => {
                    e.preventDefault()
                    handleSavingSubmit(formData)
                }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="w-full md:w-1/2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Description
                            </label>
                            <input
                                type="text"
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div className="w-full md:w-1/2">
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                </div>
                                <DatePicker
                                    selected={formData.date}
                                    onChange={(date: Date | null) => date && setFormData(prev => ({ ...prev, date }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    dateFormat={dateFormat}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="w-full md:w-1/2">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <DollarSign className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    id="amount"
                                    value={formData.amount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="w-full md:w-1/2">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Is recurring?
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isRecurring"
                                        checked={formData.isRecurring}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Recurring
                                    </label>
                                </div>
                                <select
                                    id="recurringFrequency"
                                    value={formData.recurringFrequency}
                                    onChange={(e) => setFormData(prev => ({ ...prev, recurringFrequency: e.target.value as PiggyBankTransaction['recurringFrequency'] }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    disabled={!formData.isRecurring}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex">
                        <button
                            type="submit"
                            className="w-full md:w-1/4 py-2 px-4 rounded-md text-sm font-medium transition-colors
                                bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>

            <SavingTable
                savings={savings}
                onEdit={handleEditSaving}
                onDelete={handleDeleteSaving}
            />

            {editingSaving && (
                <EditSavingModal
                    saving={editingSaving}
                    onClose={() => setEditingSaving(null)}
                    onSave={handleSaveSaving}
                />
            )}

            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    )
} 