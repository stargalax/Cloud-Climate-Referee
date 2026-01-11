'use client'

import { useState, useEffect, useRef } from 'react'
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps'
import { motion, AnimatePresence } from 'framer-motion'
import { AWS_REGIONS } from '../../data/aws-regions'
import { getVerdictColor } from '../../utils/colors'
import type { ArbitratorVerdict } from '../../types'

// World map topology URL (simplified world map)
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

interface GlobalPitchProps {
    verdicts?: Record<string, ArbitratorVerdict>
    selectedRegion?: string | null
    onRegionSelect?: (regionCode: string) => void
}

export default function GlobalPitch({
    verdicts = {},
    selectedRegion = null,
    onRegionSelect
}: GlobalPitchProps) {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
    const [focusedRegion, setFocusedRegion] = useState<string | null>(null)
    const mapRef = useRef<HTMLDivElement>(null)

    const getMarkerColor = (regionCode: string) => {
        const verdict = verdicts[regionCode]
        if (!verdict) return '#6B7280' // Gray for no data

        const colors = getVerdictColor(verdict.verdict)
        return colors.primary
    }

    const getMarkerGlow = (regionCode: string) => {
        const verdict = verdicts[regionCode]
        if (!verdict) return 'shadow-gray-500/20'

        const colors = getVerdictColor(verdict.verdict)
        return colors.glow
    }

    const isRegionActive = (regionCode: string) => {
        return selectedRegion === regionCode || hoveredRegion === regionCode || focusedRegion === regionCode
    }

    // Handle keyboard navigation within the map
    const handleKeyDown = (event: KeyboardEvent, regionCode: string) => {
        switch (event.key) {
            case 'Enter':
            case ' ':
                onRegionSelect?.(regionCode)
                event.preventDefault()
                break
            case 'Escape':
                setFocusedRegion(null)
                event.preventDefault()
                break
        }
    }

    // Focus management for accessibility
    useEffect(() => {
        if (selectedRegion && mapRef.current) {
            const markerButton = mapRef.current.querySelector(`[data-region="${selectedRegion}"]`) as HTMLElement
            if (markerButton) {
                markerButton.focus()
            }
        }
    }, [selectedRegion])

    return (
        <div
            className="glass-panel-enhanced h-80 sm:h-96 relative overflow-hidden"
            ref={mapRef}
            role="application"
            aria-label="Interactive world map showing AWS regions with referee verdicts"
        >
            {/* Stadium Spotlight Effect */}
            <AnimatePresence>
                {selectedRegion && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            background: `radial-gradient(circle at ${AWS_REGIONS.find(r => r.regionCode === selectedRegion)?.coordinates[0]
                                ? ((AWS_REGIONS.find(r => r.regionCode === selectedRegion)!.coordinates[0] + 180) / 360) * 100
                                : 50
                                }% ${AWS_REGIONS.find(r => r.regionCode === selectedRegion)?.coordinates[1]
                                    ? ((90 - AWS_REGIONS.find(r => r.regionCode === selectedRegion)!.coordinates[1]) / 180) * 100
                                    : 50
                                }%, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 30%, transparent 60%)`
                        }}
                    />
                )}
            </AnimatePresence>

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 120,
                    center: [0, 20]
                }}
                className="w-full h-full"
                role="img"
                aria-label="World map"
            >
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="rgba(71, 85, 105, 0.3)"
                                stroke="rgba(148, 163, 184, 0.2)"
                                strokeWidth={0.5}
                                className="outline-none"
                            />
                        ))
                    }
                </Geographies>

                {/* AWS Region Markers */}
                {AWS_REGIONS.map((region, index) => {
                    const isActive = isRegionActive(region.regionCode)
                    const markerColor = getMarkerColor(region.regionCode)
                    const verdict = verdicts[region.regionCode]

                    return (
                        <Marker
                            key={region.regionCode}
                            coordinates={region.coordinates}
                        >
                            <motion.g
                                layoutId={`region-marker-${region.regionCode}`}
                                whileHover={{ scale: 1.3 }}
                                animate={{
                                    scale: isActive ? 1.2 : 1,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                    layout: { duration: 0.3 }
                                }}
                            >
                                {/* Invisible button for keyboard accessibility */}
                                <foreignObject x={-15} y={-15} width={30} height={30}>
                                    <button
                                        data-region={region.regionCode}
                                        className="w-full h-full bg-transparent border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-full"
                                        onMouseEnter={() => setHoveredRegion(region.regionCode)}
                                        onMouseLeave={() => setHoveredRegion(null)}
                                        onFocus={() => setFocusedRegion(region.regionCode)}
                                        onBlur={() => setFocusedRegion(null)}
                                        onClick={() => onRegionSelect?.(region.regionCode)}
                                        onKeyDown={(e) => handleKeyDown(e.nativeEvent, region.regionCode)}
                                        aria-label={`${region.displayName} (${region.regionCode}) - ${verdict ? `${verdict.verdict}, Score: ${Math.round(verdict.scores.composite.overallScore)}` : 'Not evaluated'}`}
                                        tabIndex={0}
                                    />
                                </foreignObject>

                                {/* Pulsing outer ring */}
                                <motion.circle
                                    r={12}
                                    fill="none"
                                    stroke={markerColor}
                                    strokeWidth={2}
                                    opacity={0.6}
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.6, 0.2, 0.6]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="pointer-events-none"
                                />

                                {/* Focus ring for keyboard navigation */}
                                {focusedRegion === region.regionCode && (
                                    <motion.circle
                                        r={10}
                                        fill="none"
                                        stroke="white"
                                        strokeWidth={2}
                                        opacity={0.8}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 0.8 }}
                                        className="pointer-events-none"
                                    />
                                )}

                                {/* Main marker circle */}
                                <circle
                                    r={6}
                                    fill={markerColor}
                                    stroke="white"
                                    strokeWidth={2}
                                    className={`drop-shadow-lg ${getMarkerGlow(region.regionCode)} pointer-events-none`}
                                    style={{
                                        filter: `drop-shadow(0 0 8px ${markerColor}40)`
                                    }}
                                />

                                {/* Region code text */}
                                <text
                                    textAnchor="middle"
                                    y={-12}
                                    className="fill-white text-xs font-medium pointer-events-none"
                                    style={{
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {region.regionCode.toUpperCase()}
                                </text>

                                {/* Number indicator for keyboard navigation */}
                                <text
                                    textAnchor="middle"
                                    y={18}
                                    className="fill-slate-400 text-xs font-medium pointer-events-none"
                                    style={{
                                        textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {index < 9 ? (index + 1).toString() : index === 9 ? '0' : ''}
                                </text>
                            </motion.g>
                        </Marker>
                    )
                })}
            </ComposableMap>

            {/* Tooltip */}
            <AnimatePresence>
                {(hoveredRegion || focusedRegion) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-4 left-4 glass-panel-enhanced p-3 min-w-48"
                        role="tooltip"
                        aria-live="polite"
                    >
                        {(() => {
                            const activeRegion = hoveredRegion || focusedRegion
                            const region = AWS_REGIONS.find(r => r.regionCode === activeRegion)
                            const verdict = verdicts[activeRegion!]

                            if (!region) return null

                            return (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: getMarkerColor(activeRegion!) }}
                                        />
                                        <span className="font-semibold text-white">
                                            {region.displayName}
                                        </span>
                                    </div>

                                    <div className="text-sm text-slate-300 space-y-1">
                                        <div>{region.city}, {region.country}</div>
                                        <div className="text-xs text-slate-400">
                                            {region.regionCode}
                                        </div>

                                        {verdict && (
                                            <div className="mt-2 pt-2 border-t border-white/10">
                                                <div className={`text-sm font-medium ${getVerdictColor(verdict.verdict).text}`}>
                                                    {verdict.verdict}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    Score: {verdict.scores.composite.overallScore.toFixed(0)}/100
                                                </div>
                                            </div>
                                        )}

                                        {focusedRegion === activeRegion && (
                                            <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-white/10">
                                                Press Enter or Space to select
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Title overlay */}
            <div className="absolute top-4 left-4">
                <motion.h3
                    className="text-lg sm:text-xl font-semibold text-white mb-1"
                    layoutId="global-pitch-title"
                >
                    Global Pitch
                </motion.h3>
                <motion.p
                    className="text-xs sm:text-sm text-slate-400"
                    layoutId="global-pitch-subtitle"
                >
                    {Object.keys(verdicts).length > 0
                        ? `${Object.keys(verdicts).length}/10 regions evaluated`
                        : "Click a region to evaluate"
                    }
                </motion.p>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 glass-panel-enhanced p-2 sm:p-3">
                <div className="text-xs sm:text-sm font-medium text-white mb-2">Referee Verdicts</div>
                <div className="space-y-1 text-xs">
                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="w-2 h-2 rounded-full bg-play-on"></div>
                        <span className="text-slate-300">Play On</span>
                    </motion.div>
                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="w-2 h-2 rounded-full bg-yellow-card"></div>
                        <span className="text-slate-300">Yellow Card</span>
                    </motion.div>
                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="w-2 h-2 rounded-full bg-red-card"></div>
                        <span className="text-slate-300">Red Card</span>
                    </motion.div>
                    <motion.div
                        className="flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                    >
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        <span className="text-slate-300">Not Evaluated</span>
                    </motion.div>
                </div>
            </div>

            {/* Keyboard navigation hint */}
            <div className="absolute bottom-4 right-4 text-xs text-slate-500">
                Use 1-9, 0 or Tab to navigate
            </div>
        </div>
    )
}