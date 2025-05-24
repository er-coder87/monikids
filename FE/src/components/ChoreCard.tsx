import { DollarSign, Trash2, Star } from "lucide-react"
import { ChoreDto } from "../models/ChoreDto"
import { useChores } from "../contexts/ChoresContext"
import { useSavings } from "../contexts/SavingsContext"
import { useToast } from "../contexts/ToastContext"
import { useState } from "react"

interface ChoreCardProps {
    chore: ChoreDto
}

export function ChoreCard({ chore }: ChoreCardProps) {
    const { updateChore } = useChores()
    const { addSaving } = useSavings()
    const { addToast } = useToast()
    const [isFlicking, setIsFlicking] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)

    const progress = (chore.currentCount ?? 0) / (chore.maxCount ?? 1)
    const isCompleted = (chore.currentCount ?? 0) >= (chore.maxCount ?? 0)
    const isPaid = !!chore.paidAtDateTime

    const handleAddSaving = async () => {
        if (isUpdating) return
        setIsUpdating(true)

        const today = new Date()
        const formattedDate = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })

        try {
            // Optimistically update the UI
            await updateChore(chore.id, {
                ...chore,
                paidAtDateTime: today.toISOString()
            })

            addSaving({
                description: `Done ${chore.description} on ${formattedDate}`,
                amount: chore.allowanceAmount ?? 0,
                date: today,
                isRecurring: false,
            })

            addToast(`Added saving $${chore.allowanceAmount} for ${chore.description}`)
        } catch (error) {
            console.error('Error updating chore:', error)
            addToast('Failed to update chore', 'error')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleComplete = async () => {
        if (isUpdating) return
        setIsUpdating(true)

        try {
            const newCount = (chore.currentCount ?? 0) + 1
            if (chore.maxCount) {
                await updateChore(chore.id, {
                    ...chore,
                    currentCount: newCount,
                    doneDateTime: newCount === chore.maxCount ? new Date().toISOString() : null
                })
                addToast(`Completed ${chore.description}`)
            }
        } catch (error) {
            console.error('Error completing chore:', error)
            addToast('Failed to complete chore', 'error')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (isUpdating) return
        setIsUpdating(true)
        setIsFlicking(true)

        // Wait for animation to complete before updating
        setTimeout(async () => {
            try {
                await updateChore(chore.id, {
                    ...chore,
                    isDeleted: true
                })
            } catch (error) {
                console.error('Error marking chore as done:', error)
                addToast('Failed to mark chore as done', 'error')
                setIsFlicking(false)
            } finally {
                setIsUpdating(false)
            }
        }, 1000) // Match this with the CSS transition duration
    }

    return (
        <div
            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-1000 ease-in-out
                ${isFlicking ? 'transform translate-x-[200%] rotate-[360deg] opacity-0 scale-75' : ''}`}
        >
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            {chore.description}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>${chore.allowanceAmount?.toFixed(2)}</span>
                            <span>•</span>
                            <span>{chore.currentCount ?? 0}/{chore.maxCount ?? 0} completed</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isCompleted ? (
                            isPaid ? (
                                <button
                                    onClick={handleDelete}
                                    disabled={isUpdating}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors rounded-md hover:bg-green-50 dark:hover:bg-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>All Done!</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddSaving}
                                    disabled={isUpdating}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <DollarSign className="h-4 w-4" />
                                    <span>Add Saving</span>
                                </button>
                            )
                        ) : (
                            <button
                                onClick={handleDelete}
                                disabled={isUpdating}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 transition-colors rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            Progress
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                            {Math.round(progress * 100)}%
                        </span>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${progress * 100}%`,
                                backgroundColor: isCompleted ? '#059669' : '#2563eb'
                            }}
                        />
                    </div>

                    {!isCompleted && (
                        <button
                            onClick={handleComplete}
                            disabled={isUpdating}
                            className="w-full mt-3 py-2 px-4 rounded-md text-sm font-medium transition-colors
                                bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Star className="h-4 w-4" />
                            <span>I Did It!</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
} 