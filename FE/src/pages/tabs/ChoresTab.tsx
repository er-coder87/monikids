import { Heart, ListChecks, DollarSign } from "lucide-react"
import { useState } from "react"
import { useGoodDeeds } from "../../contexts/GoodDeedsContext"
import { useChores } from "../../contexts/ChoresContext"
import { ChoreCard } from "../../components/ChoreCard"

export function ChoresTab() {
    const [choreData, setChoreData] = useState({
        description: '',
        frequency: 1,
        savingAmount: 0
    })
    const { goodDeed, setGoodDeed, updateGoodDeed, isLoading: isGoodDeedsLoading } = useGoodDeeds()
    const { chores, addChore, isLoading: isChoresLoading } = useChores()
    const [hasStampChanges, setHasStampChanges] = useState(false)

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
        } catch (error) {
            console.error('Error saving good deeds:', error)
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
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ListChecks className="h-5 w-5" />
                        House Chores
                    </h2>
                </div>

                <form onSubmit={handleChoreSubmit} className="space-y-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            Add Chore
                        </button>
                    </div>
                </form>

                {chores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...chores]
                            .filter(chore => !chore.doneDateTime)
                            .sort((a, b) => new Date(b.createdDateTime).getTime() - new Date(a.createdDateTime).getTime())
                            .map(chore => (
                                <ChoreCard
                                    key={chore.id}
                                    chore={chore}
                                />
                            ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No chores added yet. Add your first chore above!
                    </div>
                )}
            </div>
        </div>
    )
}
