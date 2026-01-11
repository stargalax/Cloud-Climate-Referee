// Main entry point for the Region Arbitrator system
export * from './types/index';
export { RegionDataCollector } from './data/DataCollector';
export { CloudRegionArbitrator } from './RegionArbitrator';

// Re-export analyzers
export { RegionLatencyAnalyzer } from './analyzers/LatencyAnalyzer';
export { RegionCarbonAnalyzer } from './analyzers/CarbonAnalyzer';
export { RegionCostAnalyzer } from './analyzers/CostAnalyzer';

// Re-export scoring components
export { RegionScoringEngine } from './scoring/ScoringEngine';
export { RegionVerdictGenerator } from './scoring/VerdictGenerator';

// Re-export commonly used types for convenience
export type {
    CloudRegion,
    ArbitratorVerdict,
    FactorWeights,
    RegionArbitrator
} from './types/index';