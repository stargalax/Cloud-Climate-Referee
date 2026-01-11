'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GlobalPitch from '@/components/map/GlobalPitch'
import PhysicalCard from '@/components/verdict/PhysicalCard'
import AnalysisPanel from '@/components/verdict/AnalysisPanel'
import VARAnalysis from '@/components/charts/VARAnalysis'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import Leaderboard from '@/components/ui/Leaderboard'
import { LoadingOverlay } from '@/components/ui/LoadingState'
import ShareButton from '@/components/ui/ShareButton'
import RefereePriorityPanel from '@/components/ui/RefereePriorityPanel'
import { useDashboard, useUrlSync } from '@/contexts/DashboardContext'
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'
import { useTheme } from '../components/ui/ThemeProvider'

export default function Home() {
    const { state, navigateToRegion, updateWeights, reevaluateAllRegions } = useDashboard()
    const { selectedRegion, verdicts, loading, error, isEvaluating } = state
    const { setTheme, playWhistle, currentTheme } = useTheme()

    // Initialize URL synchronization
    useUrlSync()

    // Initialize keyboard navigation
    const keyboardNav = useKeyboardNavigation({
        enableGlobalShortcuts: true,
        enableRegionNavigation: true,
        enableAccessibility: true
    })

    // Determine if we should use dark text for light backgrounds
    const shouldUseDarkText = currentTheme === 'yellow' || currentTheme === 'green' || currentTheme === 'red'
    const headerTextClass = shouldUseDarkText ? 'text-slate-900' : 'text-white'
    const subtitleTextClass = shouldUseDarkText ? 'text-slate-700' : 'text-slate-300'

    const handleRegionSelect = (regionCode: string) => {
        navigateToRegion(regionCode)

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

    // Handle keyboard shortcut for help
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
                // Removed shortcuts functionality
                event.preventDefault()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

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
                    <p className="text-slate-400 mb-4">{error}</p>
                    <motion.button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-300 hover:text-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Retry
                    </motion.button>
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
                        className="text-center py-4 sm:py-6 lg:py-8 relative"
                    >
                        <motion.h1
                            className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-shadow mb-2 transition-colors duration-500 ${headerTextClass}`}
                            layoutId="main-title"
                        >
                            ⚽ Region Arbitrator Dashboard
                        </motion.h1>
                        <motion.p
                            className={`text-sm sm:text-base lg:text-lg mb-4 transition-colors duration-500 ${subtitleTextClass}`}
                            layoutId="main-subtitle"
                        >
                            The Referee has reviewed your cloud infrastructure choices
                        </motion.p>

                        {/* Header Controls */}
                        <div className="flex items-center justify-center">
                            <ShareButton
                                variant="text"
                                size="small"
                                isDarkBackground={!shouldUseDarkText}
                            />
                        </div>

                        {/* Navigation hint */}
                        {!selectedRegion && (
                            <motion.div
                                className={`mt-4 text-xs transition-colors duration-500 ${shouldUseDarkText ? 'text-slate-600' : 'text-slate-500'}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                            >
                                💡 Use arrow keys or click to navigate regions
                            </motion.div>
                        )}
                    </motion.header>

                    {/* Loading Overlay */}
                    <LoadingOverlay
                        isVisible={loading || isEvaluating}
                        message={isEvaluating ? "The Referee is applying your new rules..." : "The Referee is analyzing cloud regions..."}
                    />

                    {/* Main Dashboard Grid - Optimized Layout */}
                    <AnimatePresence mode="wait">
                        {!loading && (
                            <motion.div
                                className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Top Row: Map + Physical Card + Priority Panel */}
                                {/* Global Pitch Map */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="xl:col-span-2 h-[400px]"
                                    layoutId="global-pitch-container"
                                >
                                    <GlobalPitch
                                        verdicts={verdicts}
                                        selectedRegion={selectedRegion}
                                        onRegionSelect={handleRegionSelect}
                                    />
                                </motion.div>

                                {/* Physical Card (Right Sidebar) */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="xl:col-span-1 h-[400px]"
                                    layoutId="physical-card-container"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedRegion || 'empty'}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }}
                                            className="h-full"
                                        >
                                            <PhysicalCard
                                                verdict={selectedRegion ? verdicts[selectedRegion] : undefined}
                                                isVisible={!!selectedRegion}
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                </motion.div>

                                {/* Referee Priority Panel - Spans 2 rows
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="xl:col-span-1 xl:row-span-2"
                                    layoutId="priority-panel-container"
                                >
                                    <RefereePriorityPanel
                                        onWeightsChange={updateWeights}
                                        onApplyRules={reevaluateAllRegions}
                                    />
                                </motion.div> */}
                                {/* Referee Priority Panel Sidebar - Spans 2 rows */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="xl:col-span-1 xl:row-span-2 flex flex-col gap-3 sm:gap-4"
                                    layoutId="priority-panel-container"
                                >
                                    {/* Top: The Priority Controls */}
                                    <RefereePriorityPanel
                                        onWeightsChange={updateWeights}
                                        onApplyRules={reevaluateAllRegions}
                                    />

                                    {/* Bottom: The Branding Logo Card (Anchored) */}
                                    <div className="glass-panel-enhanced flex-grow flex flex-col items-center justify-center p-6 border-t border-white/5 transition-all duration-300 hover:bg-slate-800/10">
                                        <motion.div
                                            className="relative mb-3"
                                            animate={{
                                                scale: [1, 1.05, 1],
                                                opacity: [0.8, 1, 0.8]
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            {/* Soft Glow behind logo */}
                                            <div className={`absolute -inset-4 rounded-full blur-xl transition-colors duration-500 ${shouldUseDarkText ? 'bg-slate-400/20' : 'bg-green-500/20'}`}></div>
                                            <span className="relative text-3xl select-none">⚖️</span>
                                        </motion.div>

                                        <div className="text-center">
                                            <h2 className={`text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500 ${shouldUseDarkText ? 'text-slate-900' : 'text-slate-500'}`}>
                                                Region Arbitrator
                                            </h2>
                                            <div className="mt-1 flex items-center justify-center gap-2">
                                                <span className={`h-[1px] w-4 ${shouldUseDarkText ? 'bg-slate-900/30' : 'bg-slate-700'}`}></span>
                                                <span className={`text-[8px] font-bold uppercase ${shouldUseDarkText ? 'text-slate-700' : 'text-slate-600'}`}>
                                                    VAR System v1.0
                                                </span>
                                                <span className={`h-[1px] w-4 ${shouldUseDarkText ? 'bg-slate-900/30' : 'bg-slate-700'}`}></span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Docked Leaderboard - Spans 3 columns */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="xl:col-span-3"
                                    layoutId="leaderboard-container"
                                >
                                    <Leaderboard
                                        verdicts={verdicts}
                                        selectedRegion={selectedRegion || undefined}
                                        onRegionSelect={handleRegionSelect}
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Analysis Panel (Below Map) */}
                    <AnimatePresence mode="wait">
                        {!loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="mt-3 sm:mt-4 lg:mt-6"
                                layoutId="analysis-panel-container"
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedRegion || 'default-analysis'}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <AnalysisPanel
                                            verdict={selectedRegion ? verdicts[selectedRegion] : undefined}
                                            isVisible={!!selectedRegion}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* VAR Analysis */}
                    <AnimatePresence mode="wait">
                        {!loading && (
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
                                            verdict={selectedRegion ? verdicts[selectedRegion] : undefined}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Keyboard Navigation Status */}
                    {selectedRegion && keyboardNav.totalRegions > 0 && (
                        <motion.div
                            className="fixed bottom-4 right-4 glass-panel-enhanced px-3 py-2 text-xs text-slate-400"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                        >
                            Region {keyboardNav.currentIndex + 1} of {keyboardNav.totalRegions}
                        </motion.div>
                    )}
                </div>
            </main>
        </ErrorBoundary>
    )
}