'use client'

import { motion } from 'framer-motion'
import { ArbitratorVerdict } from '../../types'
import { getVerdictColor } from '../../utils/colors'

interface PhysicalCardProps {
    verdict?: ArbitratorVerdict
    isVisible?: boolean
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
            className="text-6xl sm:text-7xl"
        >
            {getIcon()}
        </motion.div>
    )
}

// Circular progress gauge component
function CircularProgress({ score, size = 100 }: { score: number; size?: number }) {
    const radius = (size - 8) / 2
    const circumference = 2 * Math.PI * radius
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (score / 100) * circumference

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
                    strokeWidth="3"
                    fill="none"
                    className="text-slate-700"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#10b981"
                    strokeWidth="3"
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
                    <div className="text-xl font-bold text-white">{Math.round(score)}</div>
                    <div className="text-xs text-slate-400">SCORE</div>
                </motion.div>
            </div>
        </div>
    )
}

export default function PhysicalCard({ verdict, isVisible = true }: PhysicalCardProps) {
    if (!verdict) {
        return (
            <motion.div
                className="glass-panel-enhanced h-80 sm:h-96 flex items-center justify-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ scale: 1.05, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                <div className="text-center p-4">
                    <div className="text-4xl sm:text-6xl mb-4">⚽</div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-300">Awaiting Verdict</h3>
                    <p className="text-sm sm:text-base text-slate-400">
                        Select a region to see the card
                    </p>
                </div>
            </motion.div>
        )
    }

    const colors = getVerdictColor(verdict.verdict)

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
            className="glass-panel-enhanced p-6 space-y-6 h-80 sm:h-96 flex flex-col justify-center items-center text-center"
            style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: `0 20px 40px -12px ${colors.primary}40, 0 8px 32px -8px ${colors.primary}20`
            }}
        >
            {/* Verdict Icon */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <VerdictIcon verdict={verdict.verdict} />
            </motion.div>

            {/* Score */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex justify-center"
            >
                <CircularProgress score={verdict.scores.composite.overallScore} />
            </motion.div>

            {/* Region Name */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="space-y-2"
            >
                <div className={`text-xl font-bold ${colors.text}`}>
                    {verdict.verdict.toUpperCase()}
                </div>
                <div className="text-lg font-semibold text-white">
                    {verdict.region.displayName}
                </div>
                <div className="text-sm text-slate-400">
                    {verdict.region.regionCode}
                </div>
            </motion.div>
        </motion.div>
    )
}