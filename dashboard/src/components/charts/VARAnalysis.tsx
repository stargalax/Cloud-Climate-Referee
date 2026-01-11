'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts'
import { ArbitratorVerdict, TickerItem } from '@/types'
import { getVerdictColor } from '@/utils/colors'
import { useRegionData } from '@/hooks/useRegionData'

interface VARAnalysisProps {
    selectedRegion?: string
    verdict?: ArbitratorVerdict
}

export default function VARAnalysis({ selectedRegion, verdict }: VARAnalysisProps) {
    const { verdicts } = useRegionData()
    const [currentCarbonIntensity, setCurrentCarbonIntensity] = useState(0)
    const [tickerItems, setTickerItems] = useState<TickerItem[]>([])

    // Generate mock 24-hour carbon intensity forecast data
    const generateForecastData = () => {
        const hours = Array.from({ length: 24 }, (_, i) => {
            const hour = new Date()
            hour.setHours(i, 0, 0, 0)
            return {
                time: hour.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
                intensity: Math.floor(Math.random() * 400) + 50, // 50-450 gCO2/kWh
                renewable: Math.floor(Math.random() * 60) + 20 // 20-80% renewable
            }
        })
        return hours
    }

    const [forecastData] = useState(generateForecastData())

    // Prepare radar chart data
    const getRadarData = () => {
        if (!verdict) return []

        return [
            {
                factor: 'Carbon',
                score: verdict.scores.carbon.score,
                fullMark: 100
            },
            {
                factor: 'Latency',
                score: verdict.scores.latency.score,
                fullMark: 100
            },
            {
                factor: 'Cost',
                score: verdict.scores.cost.score,
                fullMark: 100
            }
        ]
    }

    // Generate ticker items
    useEffect(() => {
        const generateTickerItems = () => {
            const regions = Object.values(verdicts)
            const items: TickerItem[] = []

            regions.forEach((verdict, index) => {
                const renewablePercent = Math.floor(verdict.scores.carbon.renewablePercentage)
                const carbonCategory = verdict.scores.carbon.category

                let message = ''
                if (renewablePercent > 80) {
                    message = `${verdict.region.displayName.toUpperCase()} IS CURRENTLY ${renewablePercent}% RENEWABLE`
                } else if (verdict.verdict === 'Red Card') {
                    message = `${verdict.region.displayName.toUpperCase()} UNDER REVIEW - HIGH CARBON INTENSITY`
                } else if (carbonCategory === 'very_clean') {
                    message = `${verdict.region.displayName.toUpperCase()} SHOWING EXCELLENT GREEN PERFORMANCE`
                } else {
                    message = `${verdict.region.displayName.toUpperCase()} - ${renewablePercent}% RENEWABLE, ${verdict.verdict.toUpperCase()}`
                }

                items.push({
                    id: `${verdict.region.regionCode}-${index}`,
                    message,
                    timestamp: new Date(),
                    type: verdict.verdict === 'Red Card' ? 'alert' : 'info'
                })
            })

            return items
        }

        if (Object.keys(verdicts).length > 0) {
            setTickerItems(generateTickerItems())
        }
    }, [verdicts])

    // Animated carbon intensity ticker
    useEffect(() => {
        if (verdict) {
            const targetIntensity = Math.floor(Math.random() * 400) + 50
            const interval = setInterval(() => {
                setCurrentCarbonIntensity(prev => {
                    const diff = targetIntensity - prev
                    if (Math.abs(diff) < 1) return targetIntensity
                    return prev + diff * 0.1
                })
            }, 100)

            return () => clearInterval(interval)
        }
    }, [verdict])

    const verdictColors = verdict ? getVerdictColor(verdict.verdict) : getVerdictColor('Play On')
    const radarData = getRadarData()

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Main Charts Panel */}
            <div className="glass-panel-enhanced p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                    <motion.h3
                        className="text-lg sm:text-xl font-semibold flex items-center gap-2"
                        layoutId="var-analysis-title"
                    >
                        <span className="text-xl sm:text-2xl">📊</span>
                        VAR Analysis
                    </motion.h3>
                    {verdict && (
                        <motion.div
                            className="flex items-center gap-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            layoutId="carbon-intensity-display"
                        >
                            <div className="text-right">
                                <div className="text-xs sm:text-sm text-slate-400">Carbon Intensity</div>
                                <motion.div
                                    className="text-xl sm:text-2xl font-mono font-bold"
                                    style={{ color: verdictColors.primary }}
                                    key={Math.floor(currentCarbonIntensity)}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {Math.floor(currentCarbonIntensity)}
                                    <span className="text-xs sm:text-sm ml-1">gCO₂/kWh</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Radar Chart */}
                    <motion.div
                        className="space-y-4"
                        layoutId="radar-chart-container"
                    >
                        <h4 className="text-base sm:text-lg font-medium">Trade-off Analysis</h4>
                        <div className="h-48 sm:h-64">
                            {radarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
                                        <PolarAngleAxis
                                            dataKey="factor"
                                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        />
                                        <PolarRadiusAxis
                                            angle={90}
                                            domain={[0, 100]}
                                            tick={{ fill: '#64748b', fontSize: 10 }}
                                        />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke={verdictColors.primary}
                                            fill={verdictColors.primary}
                                            fillOpacity={0.2}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm sm:text-base text-center px-4">
                                    Select a region to view trade-off analysis
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* 24-Hour Forecast */}
                    <motion.div
                        className="space-y-4"
                        layoutId="forecast-chart-container"
                    >
                        <h4 className="text-base sm:text-lg font-medium">24-Hour Carbon Forecast</h4>
                        <div className="h-48 sm:h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={forecastData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                        interval="preserveStartEnd"
                                    />
                                    <YAxis
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                        label={{ value: 'gCO₂/kWh', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#64748b' } }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(148, 163, 184, 0.2)',
                                            borderRadius: '8px',
                                            color: '#e2e8f0'
                                        }}
                                        formatter={(value: number, name: string) => [
                                            `${value} gCO₂/kWh`,
                                            'Carbon Intensity'
                                        ]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="intensity"
                                        stroke={verdictColors.primary}
                                        fill={verdictColors.primary}
                                        fillOpacity={0.2}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                </div>
            </div>
        </div>

        {/* Live Ticker Panel */ }
    <motion.div
        className="glass-panel-enhanced h-12 sm:h-16 overflow-hidden relative"
        layoutId="live-ticker-container"
    >
        <div className="absolute inset-0 flex items-center">
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-xs sm:text-sm">
                <span className="animate-pulse">🔴</span>
                LIVE
            </div>
            <div className="flex-1 overflow-hidden">
                <AnimatePresence>
                    {tickerItems.length > 0 && (
                        <motion.div
                            className="flex items-center whitespace-nowrap"
                            initial={{ x: '100%' }}
                            animate={{ x: '-100%' }}
                            transition={{
                                duration: 30,
                                repeat: Infinity,
                                ease: 'linear'
                            }}
                        >
                            {tickerItems.map((item, index) => (
                                <span
                                    key={item.id}
                                    className={`px-4 sm:px-8 text-xs sm:text-sm font-medium ${item.type === 'alert' ? 'text-red-400' : 'text-slate-300'
                                        }`}
                                >
                                    LATEST: {item.message}
                                    {index < tickerItems.length - 1 && (
                                        <span className="mx-2 sm:mx-4 text-slate-500">•</span>
                                    )}
                                </span>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    </motion.div>
        </div >
    )
}