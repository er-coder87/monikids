import { Calendar, DollarSign, PiggyBank } from "lucide-react"
import { useState } from "react"
import DatePicker from "react-datepicker"
import { EditSavingModal } from "../../components/EditSavingModal"
import { SavingTable } from "../../components/SavingTable"
import { useSavings } from "../../contexts/SavingsContext"
import { useToast } from "../../contexts/ToastContext"

interface PiggyBankTransaction {
    description: string
    amount: number
    date: Date
    isRecurring: boolean
    recurringFrequency?: 'daily' | 'weekly' | 'monthly'
}

interface SavingsTabProps {
    dateFormat: 'dd-MM-yyyy' | 'yyyy-MM-dd'
}

interface Saving {
    id: string
    description: string
    amount: number
    date: Date
    isRecurring: boolean
    recurringFrequency?: 'daily' | 'weekly' | 'monthly'
}

export function SavingsTab({ dateFormat }: SavingsTabProps) {
    const [formData, setFormData] = useState<PiggyBankTransaction>({
        description: '',
        amount: 0,
        date: new Date(),
        isRecurring: false,
        recurringFrequency: 'monthly'
    })

    const { savings, totalSavings, addSaving, updateSaving, deleteSaving } = useSavings()
    const [editingSaving, setEditingSaving] = useState<Saving | null>(null)
    const { addToast } = useToast()

    const handleSavingSubmit = async (transaction: PiggyBankTransaction) => {
        if (editingSaving) {
            updateSaving({ ...transaction, id: editingSaving.id })
            setEditingSaving(null)
        } else {
            addSaving(transaction)
        }

        setFormData({
            description: '',
            amount: 0,
            date: new Date(),
            isRecurring: false,
            recurringFrequency: 'monthly'
        })

        addToast(`Added $${transaction.amount.toFixed(2)} for ${transaction.description}`)
    }

    const handleEditSaving = (saving: Saving) => {
        setEditingSaving(saving)
    }

    const handleSaveSaving = (updatedSaving: Saving) => {
        updateSaving(updatedSaving)
        setEditingSaving(null)
        addToast(`Updated saving: ${updatedSaving.description}`)
    }

    const handleDeleteSaving = (id: string) => {
        const saving = savings.find(a => a.id === id)
        if (saving) {
            deleteSaving(id)
            addToast(`Deleted saving: ${saving.description}`)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-gray-100/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
