'use client'

import { motion } from 'framer-motion'
import { ArbitratorVerdict } from '../../types'
import { getVerdictColor, getConfidenceColor } from '../../utils/colors'

interface AnalysisPanelProps {
    verdict?: ArbitratorVerdict
    isVisible?: boolean
}

// Mini gauge component for metrics
function MiniGauge({ score, label, color }: { score: number; label: string; color: string }) {
    const size = 80
    const radius = (size - 6) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (score / 100) * circumference

    return (
        <div className="flex flex-col items-center space-y-2">
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
                        strokeWidth="3"
                        fill="none"
                        className="text-slate-700"
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="text-center"
                    >
                        <div className="text-lg font-bold text-white">{Math.round(score)}</div>
                    </motion.div>
                </div>
            </div>
            <div className="text-xs text-slate-400 font-medium">{label}</div>
        </div>
    )
}

export default function AnalysisPanel({ verdict, isVisible = true }: AnalysisPanelProps) {
    if (!verdict) {
        return (
            <motion.div
                className="glass-panel-enhanced p-6 text-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                <div className="text-slate-400">
                    Select a region to see the Referee&apos;s analysis
                </div>
            </motion.div>
        )
    }

    const colors = getVerdictColor(verdict.verdict)
    const confidenceLevel = verdict.scores.composite.confidence >= 0.8 ? 'High' :
        verdict.scores.composite.confidence >= 0.6 ? 'Medium' : 'Low'

    return (
        <motion.div
            initial={{ y: 50, rotate: -2, opacity: 0 }}
            animate={{
                y: isVisible ? 0 : 50,
                rotate: isVisible ? 0 : -2,
                opacity: isVisible ? 1 : 0
            }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 10
            }}
            className="glass-panel-enhanced p-6"
            style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: `0 10px 30px -8px ${colors.primary}30`
            }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1: Analysis */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">📋</span>
                        <h3 className="text-lg font-semibold text-white">Referee&apos;s Analysis</h3>
                        <div className="ml-auto text-xs text-slate-400">
                            Confidence: <span className={getConfidenceColor(verdict.scores.composite.confidence)}>{confidenceLevel}</span>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                        <p className="text-slate-200 leading-relaxed text-sm">
                            {verdict.reason}
                        </p>
                    </div>
                </motion.div>

                {/* Column 2: Substitution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">🔄</span>
                        <h3 className="text-lg font-semibold text-white">Substitution</h3>
                    </div>
                    {verdict.suggestion ? (
                        <div className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}>
                            <div className="flex items-start gap-3">
                                <div className="text-xl">
                                    {verdict.suggestion.type === 'alternative_region' ? '🌱' :
                                        verdict.suggestion.type === 'optimization_strategy' ? '⚙️' : '🤷‍♂️'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-slate-200 mb-2 text-sm">
                                        {verdict.suggestion.description}
                                    </p>
                                    {verdict.suggestion.alternativeRegion && (
                                        <div className="text-xs text-slate-400">
                                            <strong>Alternative:</strong> {verdict.suggestion.alternativeRegion.displayName}
                                        </div>
                                    )}
                                    {verdict.suggestion.expectedImpact && (
                                        <div className="text-xs text-slate-400 mt-1">
                                            <strong>Impact:</strong> {verdict.suggestion.expectedImpact}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 text-center">
                            <p className="text-slate-400 text-sm">No substitution needed</p>
                        </div>
                    )}
                </motion.div>

                {/* Column 3: Mini Gauges */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">📊</span>
                        <h3 className="text-lg font-semibold text-white">Raw Metrics</h3>
                    </div>
                    <div className="flex justify-around items-center">
                        <MiniGauge
                            score={verdict.scores.carbon.score}
                            label="CARBON"
                            color="#10b981"
                        />
                        <MiniGauge
                            score={verdict.scores.latency.score}
                            label="LATENCY"
                            color="#3b82f6"
                        />
                        <MiniGauge
                            score={verdict.scores.cost.score}
                            label="COST"
                            color="#8b5cf6"
                        />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}