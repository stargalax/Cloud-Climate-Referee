// Main entry point for the Region Arbitrator system
export * from './types/index.js';
export { RegionDataCollector } from './data/DataCollector.js';

// Re-export commonly used types for convenience
export type {
    CloudRegion,
    ArbitratorVerdict,
    FactorWeights,
    RegionArbitrator
} from './types/index.js';