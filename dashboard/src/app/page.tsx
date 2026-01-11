'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlobalPitch from '@/components/map/GlobalPitch'
import RefereeCard from '@/components/verdict/RefereeCard'
import VARAnalysis from '@/components/charts/VARAnalysis'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { useRegionData } from '@/hooks/useRegionData'
import { useTheme } from '../components/ui/ThemeProvider'

export default function Home() {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
    const [previousRegion, setPreviousRegion] = useState<string | null>(null)
    const { verdicts, loading, error } = useRegionData()
    const { setTheme, playWhistle } = useTheme()

    const handleRegionSelect = (regionCode: string) => {
        setPreviousRegion(selectedRegion)
        setSelectedRegion(regionCode)

        // Update theme based on verdict
        const verdict = verdicts[regionCode]
        if (verdict) {
            playWhistle() // Play whistle sound when new verdict appears

            switch (verdict.verdict) {
                case 'Red Card':
                    setTheme('red')
                    break
                case 'Yellow Card':
                    setTheme('yellow')
                    break
                case 'Play On':
                    setTheme('green')
                    break
                default:
                    setTheme('default')
            }
        }
    }

    // Reset theme when no region is selected
    useEffect(() => {
        if (!selectedRegion) {
            setTheme('default')
        }
    }, [selectedRegion, setTheme])

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    className="text-center glass-panel-enhanced p-8 max-w-md"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="text-red-400 text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold mb-2 text-red-400">Error Loading Data</h2>
                    <p className="text-slate-400">{error}</p>
                </motion.div>
            </div>
        )
    }

    return (
        <ErrorBoundary>
            <main className="min-h-screen p-2 sm:p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-4 sm:py-6 lg:py-8"
                    >
                        <motion.h1
                            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-shadow mb-2"
                            layoutId="main-title"
                        >
                            ⚽ Region Arbitrator Dashboard
                        </motion.h1>
                        <motion.p
                            className="text-slate-300 text-sm sm:text-base lg:text-lg"
                            layoutId="main-subtitle"
                        >
                            The Referee has reviewed your cloud infrastructure choices
                        </motion.p>
                    </motion.header>

                    {/* Main Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                        {/* Global Pitch Map */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2"
                            layoutId="global-pitch-container"
                        >
                            <GlobalPitch
                                verdicts={verdicts}
                                selectedRegion={selectedRegion}
                                onRegionSelect={handleRegionSelect}
                            />
                        </motion.div>

                        {/* Referee's Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            layoutId="referee-card-container"
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedRegion || 'empty'}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <RefereeCard
                                        verdict={selectedRegion ? verdicts[selectedRegion] : undefined}
                                        isVisible={!!selectedRegion}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* VAR Analysis */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-3 sm:mt-4 lg:mt-6"
                        layoutId="var-analysis-container"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedRegion || 'default'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                            >
                                <VARAnalysis
                                    selectedRegion={selectedRegion || undefined}
                                    verdict={selectedRegion ? verdicts[selectedRegion] : undefined}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>
            </main>
        </ErrorBoundary>
    )
}