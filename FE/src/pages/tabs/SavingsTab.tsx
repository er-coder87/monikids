import { Calendar, DollarSign, PiggyBank } from "lucide-react"
import { useState } from "react"
import DatePicker from "react-datepicker"
import { EditSavingModal } from "../../components/EditSavingModal"
import { SavingTable } from "../../components/SavingTable"
import { useSavings } from "../../contexts/SavingsContext"
import { TimePeriodSelector } from "../../components/TimePeriodSelector"
import { useTimePeriod } from "../../contexts/TimePeriodContext"

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

    const { savingsOrCashOuts, addSaving, updateSaving, deleteSaving } = useSavings()
    const { startDate, endDate } = useTimePeriod()
    const [editingSaving, setEditingSaving] = useState<Saving | null>(null)

    const filteredSavings = savingsOrCashOuts.filter(saving => {
        const savingDate = new Date(saving.date)
        return savingDate >= startDate && savingDate <= endDate
    })

    const currentSavings = filteredSavings.reduce((sum, saving) => sum + saving.amount, 0)
    const periodTotalSavings = filteredSavings
        .filter(saving => saving.amount > 0)
        .reduce((sum, saving) => sum + saving.amount, 0)

    const periodTotalCashOut = filteredSavings
        .filter(saving => saving.amount < 0)
        .reduce((sum, saving) => sum + saving.amount, 0)

    const handleSavingSubmit = async (transaction: PiggyBankTransaction) => {
        try {
            if (editingSaving) {
                await updateSaving({ ...transaction, id: editingSaving.id })
                setEditingSaving(null)
            } else {
                await addSaving(transaction)
            }

            setFormData({
                description: '',
                amount: 0,
                date: new Date(),
                isRecurring: false,
                recurringFrequency: 'monthly'
            })
        } catch (error) {
            console.error('Error saving transaction:', error)
        }
    }

    const handleEditSaving = (saving: Saving) => {
        setEditingSaving(saving)
    }

    const handleSaveSaving = async (updatedSaving: Saving) => {
        try {
            await updateSaving(updatedSaving)
            setEditingSaving(null)
        } catch (error) {
            console.error('Error updating saving:', error)
        }
    }

    const handleDeleteSaving = async (id: string) => {
        try {
            await deleteSaving(id)
        } catch (error) {
            console.error('Error deleting saving:', error)
        }
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className='flex justify-start'>
                <TimePeriodSelector dateFormat={dateFormat} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 w-full">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Saving</h2>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                ${periodTotalSavings.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 w-full">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Savings</h2>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                ${currentSavings.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700 w-full">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Cashout</h2>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                ${Math.abs(periodTotalCashOut).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Saving</h2>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        handleSavingSubmit(formData)
                    }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
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
                                        className="block w-full pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 px-3 py-2"
                                        step="0.01"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
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
                                        dateFormat={dateFormat}
                                        className="block w-full pl-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 px-3 py-2"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Recurring
                                </label>
                                <div className="mt-1 flex items-center space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isRecurring}
                                            onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500 dark:border-gray-600"
                                        />
                                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Recurring</span>
                                    </label>
                                    {formData.isRecurring && (
                                        <select
                                            value={formData.recurringFrequency}
                                            onChange={(e) => setFormData(prev => ({ ...prev, recurringFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                                            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 px-3 py-2"
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {editingSaving ? 'Update Saving' : 'Add Saving'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <SavingTable
                savings={filteredSavings}
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
        </div>
    )
}
