import { useState } from 'react'
import { PiggyBank, Coins } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WithdrawModalProps {
    isOpen: boolean
    onClose: () => void
    onWithdraw: (amount: number) => void
    maxAmount: number
}

export function WithdrawModal({ isOpen, onClose, onWithdraw, maxAmount }: WithdrawModalProps) {
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')
    const [isAnimating, setIsAnimating] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const numAmount = parseFloat(amount)

        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Please enter a valid amount')
            return
        }

        if (numAmount > maxAmount) {
            setError(`Oops! You can't withdraw more than $${maxAmount.toFixed(2)}`)
            return
        }

        setIsAnimating(true)
        onWithdraw(numAmount)

        // Wait for animation to complete before closing
        setTimeout(() => {
            setAmount('')
            setError('')
            setIsAnimating(false)
            onClose()
        }, 1500)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <PiggyBank className="w-6 h-6 text-pink-500" />
                        Take money from piggy
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            How much would you like to take out?
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={(e) => {
                                    setAmount(e.target.value)
                                    setError('')
                                }}
                                step="0.01"
                                min="0"
                                max={maxAmount}
                                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                placeholder="0.00"
                            />
                        </div>
                        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                        <p className="mt-1 text-sm text-gray-500">
                            You have ${maxAmount.toFixed(2)} in your piggy bank
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Coins className="w-5 h-5" />
                            Take Money
                        </button>
                    </div>
                </form>

                <AnimatePresence>
                    {isAnimating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.5 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="flex flex-col items-center"
                            >
                                <motion.div
                                    animate={{
                                        y: [-20, -150],
                                        opacity: [1, 0],
                                        scale: [1, 1.2],
                                        rotate: [0, 5, -5, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        ease: [0.4, 0, 0.2, 1],
                                        times: [0, 0.2, 0.8, 1],
                                    }}
                                    className="text-4xl font-bold text-green-500"
                                >
                                    +${amount}
                                </motion.div>
                                <motion.div
                                    animate={{
                                        y: [-20, -150],
                                        opacity: [1, 0],
                                        scale: [1, 1.2],
                                        rotate: [0, -5, 5, 0],
                                    }}
                                    transition={{
                                        duration: 3,
                                        ease: [0.4, 0, 0.2, 1],
                                        times: [0, 0.2, 0.8, 1],
                                        delay: 0.1,
                                    }}
                                    className="text-yellow-500"
                                >
                                    <Coins className="w-12 h-12" />
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
} 