'use client'

import { motion } from 'framer-motion'
import { ArbitratorVerdict } from '@/types'
import { getVerdictColor } from '@/utils/colors'

interface LeaderboardProps {
    verdicts: Record<string, ArbitratorVerdict>
    selectedRegion?: string
    onRegionSelect?: (regionCode: string) => void
}

export default function Leaderboard({ verdicts, selectedRegion, onRegionSelect }: LeaderboardProps) {
    // Sort verdicts by composite score and get top 3
    const topRegions = Object.values(verdicts)
        .sort((a, b) => b.scores.composite.overallScore - a.scores.composite.overallScore)
        .slice(0, 3)

    if (topRegions.length === 0) {
        return (
            <div className="glass-panel-enhanced p-6 text-center">
                <p className="text-slate-400">No regions available</p>
            </div>
        )
    }

    return (
        <motion.div
            className="glass-panel-enhanced p-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <span className="text-xl">🏆</span>
                Top Regions
            </h3>

            <div className="space-y-3">
                {topRegions.map((verdict, index) => {
                    const colors = getVerdictColor(verdict.verdict)
                    const isSelected = selectedRegion === verdict.region.regionCode
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'

                    return (
                        <motion.button
                            key={verdict.region.regionCode}
                            onClick={() => onRegionSelect?.(verdict.region.regionCode)}
                            className={`
                                w-full p-4 rounded-lg border transition-all duration-300
                                ${isSelected
                                    ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-offset-slate-900 ${colors.primary}`
                                    : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600/50'
                                }
                                text-left focus:outline-none focus:ring-2 focus:ring-slate-400/50
                            `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <span className="text-2xl">{medal}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white truncate">
                                            {verdict.region.displayName}
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            {verdict.region.regionCode}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 ml-4">
                                    <div className="text-right">
                                        <div className={`text-lg font-bold ${colors.text}`}>
                                            {Math.round(verdict.scores.composite.overallScore)}
                                        </div>
                                        <div className="text-xs text-slate-400">Score</div>
                                    </div>
                                    <div className="text-2xl">
                                        {verdict.verdict === 'Red Card' && '🟥'}
                                        {verdict.verdict === 'Yellow Card' && '🟨'}
                                        {verdict.verdict === 'Play On' && '🟢'}
                                        {verdict.verdict === 'Blue Card' && '🔵'}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    )
                })}
            </div>
        </motion.div>
    )
}
