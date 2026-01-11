// Re-export types from the main RegionArbitrator system
export interface CloudRegion {
    provider: 'AWS' | 'Azure' | 'GCP' | 'Other'
    regionCode: string
    displayName: string
    location: GeographicLocation
}

export interface GeographicLocation {
    country: string
    city?: string
    latitude: number
    longitude: number
}

export interface ArbitratorVerdict {
    region: CloudRegion
    verdict: 'Red Card' | 'Yellow Card' | 'Play On' | 'Blue Card'
    reason: string
    suggestion: GreenSuggestion
    scores: {
        latency: LatencyScore
        carbon: CarbonScore
        cost: CostScore
        composite: CompositeScore
    }
    timestamp: Date
    refereeConfidence?: 'High' | 'Medium' | 'Low'
}

export interface GreenSuggestion {
    type: 'alternative_region' | 'optimization_strategy' | 'no_better_option'
    description: string
    alternativeRegion?: CloudRegion
    expectedImpact?: string
}

export interface CompositeScore {
    overallScore: number // 0-100
    weightedBreakdown: {
        latency: number
        carbon: number
        cost: number
    }
    confidence: number // 0-1
}

export interface FactorWeights {
    latency: number // 0-1, default 0.4
    carbon: number // 0-1, default 0.4  
    cost: number // 0-1, default 0.2
}

export interface FactorScore {
    score: number // 0-100 normalized score
    confidence: number // 0-1 confidence level
    reasoning: string
}

export type LatencyScore = FactorScore & {
    category: 'excellent' | 'good' | 'acceptable' | 'poor'
}

export type CarbonScore = FactorScore & {
    category: 'very_clean' | 'clean' | 'moderate' | 'high_carbon'
    renewablePercentage: number
}

export type CostScore = FactorScore & {
    category: 'very_affordable' | 'affordable' | 'moderate' | 'expensive'
    relativeCostIndex: number
}

// Dashboard-specific types
export interface DashboardState {
    selectedRegion: string | null
    verdicts: Record<string, ArbitratorVerdict>
    loading: boolean
    error: string | null
}

export interface MapMarker {
    regionCode: string
    coordinates: [number, number]
    verdict?: 'Red Card' | 'Yellow Card' | 'Play On' | 'Blue Card'
    score?: number
}

export interface ChartData {
    name: string
    carbon: number
    latency: number
    cost: number
    composite: number
}

export interface TickerItem {
    id: string
    message: string
    timestamp: Date
    type: 'update' | 'alert' | 'info'
}