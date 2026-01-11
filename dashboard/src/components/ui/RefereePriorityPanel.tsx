'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboard } from '@/contexts/DashboardContext'

interface FactorWeights {
    carbon: number    // Eco-Friendly
    latency: number   // Performance  
    cost: number      // Budget
}

interface RefereePriorityPanelProps {
    onWeightsChange?: (weights: FactorWeights) => void
    onApplyRules?: () => void
    className?: string
}

export default function RefereePriorityPanel({
    onWeightsChange,
    onApplyRules,
    className = ''
}: RefereePriorityPanelProps) {
    // Default weights from referee logic: Carbon 40%, Latency 40%, Cost 20%
    const [weights, setWeights] = useState<FactorWeights>({
        carbon: 40,   // Eco-Friendly
        latency: 40,  // Performance
        cost: 20      // Budget
    })

    const [isApplying, setIsApplying] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const { state } = useDashboard()

    // Track if weights have changed from defaults
    useEffect(() => {
        const defaultWeights = { carbon: 40, latency: 40, cost: 20 }
        const changed = weights.carbon !== defaultWeights.carbon ||
            weights.latency !== defaultWeights.latency ||
            weights.cost !== defaultWeights.cost
        setHasChanges(changed)
    }, [weights])

    // Normalize weights to ensure they sum to 100
    const normalizeWeights = (newWeights: FactorWeights): FactorWeights => {
        const total = newWeights.carbon + newWeights.latency + newWeights.cost
        if (total === 0) return { carbon: 33.33, latency: 33.33, cost: 33.33 }

        return {
            carbon: (newWeights.carbon / total) * 100,
            latency: (newWeights.latency / total) * 100,
            cost: (newWeights.cost / total) * 100
        }
    }

    const handleSliderChange = (factor: keyof FactorWeights, value: number) => {
        const newWeights = { ...weights, [factor]: value }
        const normalized = normalizeWeights(newWeights)
        setWeights(normalized)

        // Convert to 0-1 scale for the scoring engine
        const engineWeights = {
            carbon: normalized.carbon / 100,
            latency: normalized.latency / 100,
            cost: normalized.cost / 100
        }

        onWeightsChange?.(engineWeights)
    }

    const handleApplyRules = async () => {
        setIsApplying(true)
        try {
            await onApplyRules?.()
            // Add a small delay for visual feedback
            await new Promise(resolve => setTimeout(resolve, 500))
        } finally {
            setIsApplying(false)
        }
    }

    const resetToDefaults = () => {
        const defaultWeights = { carbon: 40, latency: 40, cost: 20 }
        setWeights(defaultWeights)
        onWeightsChange?.({
            carbon: 0.4,
            latency: 0.4,
            cost: 0.2
        })
    }

    const getVerdictPreview = () => {
        if (weights.carbon >= 80) {
            return { text: "Eco-Priority Mode", color: "text-green-400", icon: "🌱" }
        } else if (weights.latency >= 80) {
            return { text: "Performance Mode", color: "text-blue-400", icon: "⚡" }
        } else if (weights.cost >= 80) {
            return { text: "Budget Mode", color: "text-yellow-400", icon: "💰" }
        } else {
            return { text: "Balanced Mode", color: "text-slate-300", icon: "⚖️" }
        }
    }

    const preview = getVerdictPreview()

    return (
        <motion.div
            className={`glass-panel-enhanced p-4 ${className}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        🏃‍♂️ Referee Priority
                    </h3>
                    <p className="text-xs text-slate-400">
                        Adjust scoring weights to match your priorities
                    </p>
                </div>

                {/* Mode indicator */}
                <motion.div
                    className={`text-sm font-medium ${preview.color} flex items-center gap-1`}
                    key={preview.text}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <span>{preview.icon}</span>
                    <span>{preview.text}</span>
                </motion.div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 mb-6">
                {/* Eco-Friendly Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            🌱 Eco-Friendly
                        </label>
                        <span className="text-sm text-slate-400 font-mono">
                            {Math.round(weights.carbon)}%
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={weights.carbon}
                            onChange={(e) => handleSliderChange('carbon', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-green"
                        />
                        <div
                            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-green-600 to-green-400 rounded-lg pointer-events-none"
                            style={{ width: `${weights.carbon}%` }}
                        />
                    </div>
                    {weights.carbon >= 80 && (
                        <motion.p
                            className="text-xs text-green-400"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            ⚠️ High carbon regions will receive Red Cards immediately
                        </motion.p>
                    )}
                </div>

                {/* Performance Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            ⚡ Performance
                        </label>
                        <span className="text-sm text-slate-400 font-mono">
                            {Math.round(weights.latency)}%
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={weights.latency}
                            onChange={(e) => handleSliderChange('latency', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-blue"
                        />
                        <div
                            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg pointer-events-none"
                            style={{ width: `${weights.latency}%` }}
                        />
                    </div>
                    {weights.latency >= 80 && (
                        <motion.p
                            className="text-xs text-blue-400"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            ⚡ Slow regions will be heavily penalized
                        </motion.p>
                    )}
                </div>

                {/* Budget Slider */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                            💰 Budget
                        </label>
                        <span className="text-sm text-slate-400 font-mono">
                            {Math.round(weights.cost)}%
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={weights.cost}
                            onChange={(e) => handleSliderChange('cost', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider-yellow"
                        />
                        <div
                            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-lg pointer-events-none"
                            style={{ width: `${weights.cost}%` }}
                        />
                    </div>
                    {weights.cost >= 80 && (
                        <motion.p
                            className="text-xs text-yellow-400"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            💰 Expensive regions will be heavily penalized
                        </motion.p>
                    )}
                </div>
            </div>

            {/* Weight Summary */}
            <div className="mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                <div className="text-xs text-slate-400 mb-2">Current Weights:</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                        <div className="text-green-400 font-mono">{Math.round(weights.carbon)}%</div>
                        <div className="text-slate-500">Eco</div>
                    </div>
                    <div className="text-center">
                        <div className="text-blue-400 font-mono">{Math.round(weights.latency)}%</div>
                        <div className="text-slate-500">Speed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-yellow-400 font-mono">{Math.round(weights.cost)}%</div>
                        <div className="text-slate-500">Cost</div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
                <motion.button
                    onClick={handleApplyRules}
                    disabled={isApplying || !hasChanges}
                    className={`
                        w-full py-3 px-4 rounded-lg font-medium text-sm
                        transition-all duration-200
                        ${hasChanges
                            ? 'bg-green-600/20 hover:bg-green-600/30 border-green-500/50 text-green-300 hover:text-green-200'
                            : 'bg-slate-700/50 border-slate-600/50 text-slate-500 cursor-not-allowed'
                        }
                        border backdrop-blur-sm
                        focus:outline-none focus:ring-2 focus:ring-green-400/50
                        disabled:opacity-50
                    `}
                    whileHover={hasChanges ? { scale: 1.02 } : {}}
                    whileTap={hasChanges ? { scale: 0.98 } : {}}
                >
                    <AnimatePresence mode="wait">
                        {isApplying ? (
                            <motion.div
                                key="applying"
                                className="flex items-center justify-center gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <span>Applying Rules...</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="apply"
                                className="flex items-center justify-center gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <span>🏃‍♂️</span>
                                <span>Apply User Rules</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.button>

                {hasChanges && (
                    <motion.button
                        onClick={resetToDefaults}
                        className="w-full py-2 px-4 rounded-lg font-medium text-xs bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 text-slate-400 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Reset to Defaults
                    </motion.button>
                )}
            </div>

            {/* Info */}
            <div className="mt-4 p-2 bg-slate-800/30 rounded border border-slate-600/20">
                <p className="text-xs text-slate-500 text-center">
                    💡 Weights are automatically normalized to sum to 100%
                </p>
            </div>
        </motion.div>
    )
}