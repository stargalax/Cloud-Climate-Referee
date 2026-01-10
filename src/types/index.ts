// Core type definitions for the Region Arbitrator system

export interface CloudRegion {
    provider: 'AWS' | 'Azure' | 'GCP' | 'Other';
    regionCode: string; // e.g., 'us-west-2', 'eastus', 'us-central1'
    displayName: string;
    location: GeographicLocation;
}

export interface GeographicLocation {
    country: string;
    city?: string;
    latitude: number;
    longitude: number;
}

// Metrics interfaces for data collection
export interface LatencyMetrics {
    averageLatency: number; // milliseconds
    p95Latency: number;
    measurementTimestamp: Date;
    sourceLocation: string;
}

export interface CarbonMetrics {
    carbonIntensity: number; // gCO2/kWh
    renewablePercentage: number;
    dataSource: string;
    lastUpdated: Date;
}

export interface CostMetrics {
    computeCostPerHour: number; // USD
    storageCostPerGB: number; // USD
    networkCostPerGB: number; // USD
    region: string;
}

// Scoring interfaces
export interface FactorScore {
    score: number; // 0-100 normalized score
    confidence: number; // 0-1 confidence level
    reasoning: string;
}

export interface LatencyScore extends FactorScore {
    category: 'excellent' | 'good' | 'acceptable' | 'poor';
}

export interface CarbonScore extends FactorScore {
    category: 'very_clean' | 'clean' | 'moderate' | 'high_carbon';
    renewablePercentage: number;
}

export interface CostScore extends FactorScore {
    category: 'very_affordable' | 'affordable' | 'moderate' | 'expensive';
    relativeCostIndex: number;
}

export interface CompositeScore {
    overallScore: number; // 0-100
    weightedBreakdown: {
        latency: number;
        carbon: number;
        cost: number;
    };
    confidence: number; // 0-1
}

// Configuration interfaces
export interface FactorWeights {
    latency: number; // 0-1, default 0.4
    carbon: number; // 0-1, default 0.3  
    cost: number; // 0-1, default 0.3
}

// Verdict and output interfaces
export interface GreenSuggestion {
    type: 'alternative_region' | 'optimization_strategy' | 'no_better_option';
    description: string;
    alternativeRegion?: CloudRegion;
    expectedImpact?: string;
}

export interface ArbitratorVerdict {
    region: CloudRegion;
    verdict: 'Red Card' | 'Yellow Card' | 'Play On';
    reason: string;
    suggestion: GreenSuggestion;
    scores: {
        latency: LatencyScore;
        carbon: CarbonScore;
        cost: CostScore;
        composite: CompositeScore;
    };
    timestamp: Date;
}

// Data collection interfaces
export interface DataCollector {
    getLatencyData(region: CloudRegion): Promise<LatencyMetrics>;
    getCarbonData(region: CloudRegion): Promise<CarbonMetrics>;
    getCostData(region: CloudRegion): Promise<CostMetrics>;
}

// Analysis interfaces
export interface LatencyAnalyzer {
    analyzeLatency(metrics: LatencyMetrics): LatencyScore;
}

export interface CarbonAnalyzer {
    analyzeCarbonImpact(metrics: CarbonMetrics): CarbonScore;
}

export interface CostAnalyzer {
    analyzeCost(metrics: CostMetrics): CostScore;
}

// Core system interfaces
export interface ScoringEngine {
    combineScores(
        latency: LatencyScore,
        carbon: CarbonScore,
        cost: CostScore,
        weights: FactorWeights
    ): CompositeScore;
}

export interface VerdictGenerator {
    generateVerdict(score: CompositeScore, region: CloudRegion): ArbitratorVerdict;
    suggestGreenAlternative(region: CloudRegion): GreenSuggestion;
}

export interface RegionArbitrator {
    evaluateRegion(region: CloudRegion): Promise<ArbitratorVerdict>;
    evaluateMultipleRegions(regions: CloudRegion[]): Promise<ArbitratorVerdict[]>;
    configureWeights(weights: FactorWeights): void;
}