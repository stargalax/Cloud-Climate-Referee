'use client'

import { motion } from 'framer-motion'
import { ArbitratorVerdict } from '../../types'
import { getVerdictColor, getScoreColor, getConfidenceColor } from '../../utils/colors'

interface RefereeCardProps {
    verdict?: ArbitratorVerdict
    isVisible?: boolean
}

// Circular progress gauge component
function CircularProgress({ score, size = 120 }: { score: number; size?: number }) {
    const radius = (size - 8) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (score / 100) * circumference

    const colors = getScoreColor(score)

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg
                width={size}
                height={size}
                className="transform -rotate-90"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-slate-700"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.primary}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-center"
                >
                    <div className="text-2xl font-bold text-white">{Math.round(score)}</div>
                    <div className="text-xs text-slate-400">SCORE</div>
                </motion.div>
            </div>
        </div>
    )
}

// Verdict icon component
function VerdictIcon({ verdict }: { verdict: 'Red Card' | 'Yellow Card' | 'Play On' | 'Blue Card' }) {
    const getIcon = () => {
        switch (verdict) {
            case 'Red Card':
                return '🟥'
            case 'Yellow Card':
                return '🟨'
            case 'Play On':
                return '🟢'
            case 'Blue Card':
                return '🔵'
        }
    }

    return (
        <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-4xl"
        >
            {getIcon()}
        </motion.div>
    )
}

// Whistle icon component
function WhistleIcon() {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-2xl animate-whistle"
        >
            🔔
        </motion.div>
    )
}

export default function RefereeCard({ verdict, isVisible = true }: RefereeCardProps) {
    if (!verdict) {
        return (
            <div className="glass-panel-enhanced h-80 sm:h-96 flex items-center justify-center animate-fade-in">
                <div className="text-center p-4">
                    <div className="text-4xl sm:text-6xl mb-4">⚽</div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-300">Awaiting Verdict</h3>
                    <p className="text-sm sm:text-base text-slate-400">
                        Select a region to see the Referee&apos;s decision
                    </p>
                </div>
            </div>
        )
    }

    const colors = getVerdictColor(verdict.verdict)
    const confidenceLevel = verdict.scores.composite.confidence >= 0.8 ? 'High' :
        verdict.scores.composite.confidence >= 0.6 ? 'Medium' : 'Low'

    return (
        <motion.div
            initial={{ y: 100, rotate: -2, opacity: 0 }}
            animate={{
                y: isVisible ? 0 : 100,
                rotate: isVisible ? -2 : -2,
                opacity: isVisible ? 1 : 0
            }}
            transition={{
                duration: 0.8,
                type: "spring",
                damping: 20,
                stiffness: 100
            }}
            className="glass-panel-enhanced p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl animate-scale-in"
            style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <WhistleIcon />
                    <div>
                        <h2 className="text-lg font-bold text-white">REFEREE&apos;S DECISION</h2>
                        <p className="text-sm text-slate-400">
                            Referee Confidence: <span className={getConfidenceColor(verdict.scores.composite.confidence)}>{confidenceLevel}</span>
                        </p>
                    </div>
                </div>
                <VerdictIcon verdict={verdict.verdict} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-center py-4"
            >
                <div className={`text-3xl font-bold ${colors.text} mb-2`}>
                    VERDICT: {verdict.verdict.toUpperCase()}
                </div>
                <div className="text-sm text-slate-400">
                    {verdict.region.displayName} ({verdict.region.regionCode})
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex justify-center"
            >
                <CircularProgress score={verdict.scores.composite.overallScore} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="space-y-3"
            >
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    📋 Referee&apos;s Analysis
                </h3>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <p className="text-slate-200 leading-relaxed">
                        {verdict.reason}
                    </p>
                </div>
            </motion.div>

            {verdict.suggestion && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    className="space-y-3"
                >
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        🔄 Substitution Recommendation
                    </h3>
                    <div className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}>
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">
                                {verdict.suggestion.type === 'alternative_region' ? '🌱' :
                                    verdict.suggestion.type === 'optimization_strategy' ? '⚙️' : '🤷‍♂️'}
                            </div>
                            <div className="flex-1">
                                <p className="text-slate-200 mb-2">
                                    {verdict.suggestion.description}
                                </p>
                                {verdict.suggestion.alternativeRegion && (
                                    <div className="text-sm text-slate-400">
                                        <strong>Alternative:</strong> {verdict.suggestion.alternativeRegion.displayName}
                                    </div>
                                )}
                                {verdict.suggestion.expectedImpact && (
                                    <div className="text-sm text-slate-400 mt-1">
                                        <strong>Expected Impact:</strong> {verdict.suggestion.expectedImpact}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700/50"
            >
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                        {Math.round(verdict.scores.carbon.score)}
                    </div>
                    <div className="text-xs text-slate-400">CARBON</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                        {Math.round(verdict.scores.latency.score)}
                    </div>
                    <div className="text-xs text-slate-400">LATENCY</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                        {Math.round(verdict.scores.cost.score)}
                    </div>
                    <div className="text-xs text-slate-400">COST</div>
                </div>
            </motion.div>
        </motion.div>
    )
}