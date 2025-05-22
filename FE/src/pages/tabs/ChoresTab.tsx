import { Check, DollarSign, Heart, ListChecks, Trash2 } from "lucide-react"
import { useState } from "react"
import { useSavings } from "../../contexts/SavingsContext"
import { useToast } from "../../contexts/ToastContext"
import { useGoodDeeds } from "../../contexts/GoodDeedsContext"
import { useChores } from "../../contexts/ChoresContext"
import { ChoreDto } from "../../models/ChoreDto"

export function ChoresTab() {
    const [choreData, setChoreData] = useState({
        description: '',
        frequency: 1,
        savingAmount: 0
    })
    const { goodDeed, setGoodDeed, updateGoodDeed, isLoading: isGoodDeedsLoading } = useGoodDeeds()
    const { chores, addChore, updateChore, deleteChore, completeChore, isLoading: isChoresLoading } = useChores()
    const [hasStampChanges, setHasStampChanges] = useState(false)
    const { addSaving } = useSavings()
    const { addToast } = useToast()

    const handleAddSaving = async (chore: ChoreDto) => {
        const today = new Date()
        const formattedDate = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })

        addSaving({
            description: `Done ${chore.description} on ${formattedDate}`,
            amount: chore.allowanceAmount ?? 0,
            date: today,
            isRecurring: false,
        })

        try {
            await updateChore(chore.id, { completeDateTime: today.toISOString() })
            addToast(`Added saving $${chore.allowanceAmount} for ${chore.description}`)
        } catch (error) {
            console.error('Error updating chore:', error)
        }
    }

    const handleChoreSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            await addChore({
                description: choreData.description,
                maxCount: choreData.frequency,
                currentCount: 0,
                allowanceAmount: choreData.savingAmount
            })

            setChoreData({
                description: '',
                frequency: 1,
                savingAmount: 0
            })
        } catch (error) {
            console.error('Error submitting chore:', error)
        }
    }

    const handleSetStamps = (newCount: number) => {
        const updatedGoodDeed = {
            ...goodDeed,
            currentCount: newCount
        }
        setGoodDeed(updatedGoodDeed)
        setHasStampChanges(true)
    }

    const handleMaxStampsChange = (value: number) => {
        const updatedGoodDeed = {
            ...goodDeed,
            maxCount: value,
            currentCount: Math.min(goodDeed.currentCount ?? 0, value)
        }
        setGoodDeed(updatedGoodDeed)
        setHasStampChanges(true)
    }

    const handleSaveStampChanges = async () => {
        try {
            await updateGoodDeed({
                maxCount: goodDeed.maxCount ?? undefined,
                currentCount: goodDeed.currentCount ?? undefined
            })
            setHasStampChanges(false)
            addToast('Good deeds saved successfully')
        } catch (error) {
            console.error('Error saving good deeds:', error)
            addToast('Failed to save good deeds', 'error')
        }
    }

    const handleDeleteByCompletionChore = async (choreId: number) => {
        try {
            await deleteChore(choreId)
            addToast('Completed house chore')
        } catch (error) {
            console.error('Error deleting chore:', error)
        }
    }

    if (isGoodDeedsLoading || isChoresLoading) {
        return (
            <div className="flex items-center justify-center min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-sm p-4 border border-gray-100/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Heart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">Good Deeds</h2>
                            <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                {goodDeed.currentCount ?? 0} / {goodDeed.maxCount ?? 10}
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
                                {(chores.filter(chore => (chore.currentCount ?? 0) >= (chore.maxCount ?? 0)).length)} / {chores.length}
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
                            value={goodDeed.maxCount ?? 10}
                            onChange={(e) => handleMaxStampsChange(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                            {[...Array(goodDeed.maxCount ?? 10)].map((_, index) => {
                                const isStamped = index < (goodDeed.currentCount ?? 0);

                                return (
                                    <button
                                        type="button"
                                        key={index}
                                        aria-label={`Stamp ${index + 1}`}
                                        className={`aspect-square w-full rounded-full border-2 flex items-center justify-center cursor-pointer transform transition-transform duration-150 hover:scale-110
                                            ${isStamped ? 'bg-yellow-400 border-yellow-500' : 'border-gray-300 dark:border-gray-600'}`}
                                        onClick={() => handleSetStamps(index + 1)}
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
                        <div className="w-full flex flex-col space-y-4">
                            <div className="flex">
                                <button
                                    type="button"
                                    onClick={handleSaveStampChanges}
                                    disabled={!hasStampChanges}
                                    className="w-full md:w-1/4 py-2 px-4 rounded-md text-sm font-medium transition-colors
                                        bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
                                >
                                    Save
                                </button>
                            </div>
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
                                                ${chore.allowanceAmount?.toFixed(2)}
                                            </span>
                                            {(chore.currentCount ?? 0) >= (chore.maxCount ?? 0) ? (
                                                chore.completeDateTime ? (
                                                    <button
                                                        onClick={() => handleDeleteByCompletionChore(chore.id)}
                                                        className="px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors rounded-md hover:bg-green-50 dark:hover:bg-green-900/30 flex items-center gap-1"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        <span>Completed</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddSaving(chore)}
                                                        className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-1"
                                                    >
                                                        <DollarSign className="h-4 w-4" />
                                                        <span>Add Saving</span>
                                                    </button>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => deleteChore(chore.id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span>Delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Progress: {chore.currentCount ?? 0}/{chore.maxCount ?? 0}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {Math.round(((chore.currentCount ?? 0) / (chore.maxCount ?? 1)) * 100)}%
                                            </span>
                                        </div>

                                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${((chore.currentCount ?? 0) / (chore.maxCount ?? 1)) * 100}%`,
                                                    backgroundColor: (chore.currentCount ?? 0) >= (chore.maxCount ?? 0) ? '#059669' : '#2563eb'
                                                }}
                                            />
                                        </div>

                                        {(chore.currentCount ?? 0) >= (chore.maxCount ?? 0) ? <></> :
                                            <div className="flex">
                                                <button
                                                    onClick={() => completeChore(chore.id)}
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
        </div>
    )
}
