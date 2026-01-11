'use client'

import { motion } from 'framer-motion'

interface LoadingStateProps {
    message?: string
    size?: 'small' | 'medium' | 'large'
    variant?: 'spinner' | 'pulse' | 'referee'
}

export default function LoadingState({
    message = 'Loading...',
    size = 'medium',
    variant = 'referee'
}: LoadingStateProps) {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-12 h-12',
        large: 'w-16 h-16'
    }

    const textSizeClasses = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg'
    }

    if (variant === 'referee') {
        return (
            <motion.div
                className="flex flex-col items-center justify-center p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Referee whistle animation */}
                <motion.div
                    className={`${sizeClasses[size]} mb-4 text-slate-400`}
                    animate={{
                        rotate: [0, -10, 10, -10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    🏃‍♂️
                </motion.div>

                {/* Loading dots */}
                <div className="flex space-x-1 mb-4">
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            className="w-2 h-2 bg-slate-400 rounded-full"
                            animate={{
                                y: [0, -8, 0],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: index * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>

                <motion.p
                    className={`${textSizeClasses[size]} text-slate-300 text-center`}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {message}
                </motion.p>
            </motion.div>
        )
    }

    if (variant === 'pulse') {
        return (
            <motion.div
                className="flex flex-col items-center justify-center p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className={`${sizeClasses[size]} bg-slate-400 rounded-full mb-4`}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <p className={`${textSizeClasses[size]} text-slate-300 text-center`}>
                    {message}
                </p>
            </motion.div>
        )
    }

    // Default spinner variant
    return (
        <motion.div
            className="flex flex-col items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className={`${sizeClasses[size]} border-2 border-slate-600 border-t-slate-300 rounded-full mb-4`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
            <p className={`${textSizeClasses[size]} text-slate-300 text-center`}>
                {message}
            </p>
        </motion.div>
    )
}

// Skeleton loading component for specific UI elements
export function SkeletonLoader({
    className = '',
    variant = 'rectangular'
}: {
    className?: string
    variant?: 'rectangular' | 'circular' | 'text'
}) {
    const baseClasses = 'bg-slate-700 animate-pulse'
    const variantClasses = {
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4'
    }

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            role="status"
            aria-label="Loading content"
        />
    )
}

// Loading overlay for full-screen loading states
export function LoadingOverlay({
    isVisible,
    message = 'The Referee is reviewing your request...',
    onCancel
}: {
    isVisible: boolean
    message?: string
    onCancel?: () => void
}) {
    if (!isVisible) return null

    return (
        <motion.div
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="loading-title"
        >
            <motion.div
                className="glass-panel-enhanced p-8 max-w-md mx-4 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
            >
                <LoadingState
                    message={message}
                    size="large"
                    variant="referee"
                />

                {onCancel && (
                    <motion.button
                        onClick={onCancel}
                        className="mt-6 px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Cancel
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    )
}