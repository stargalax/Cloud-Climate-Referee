import { RegionCostAnalyzer } from '../CostAnalyzer';
import { CostMetrics } from '../../types/index';

describe('RegionCostAnalyzer', () => {
    let analyzer: RegionCostAnalyzer;

    beforeEach(() => {
        analyzer = new RegionCostAnalyzer();
    });

    describe('analyzeCost', () => {
        it('should analyze baseline cost metrics correctly', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: 0.10,  // Baseline
                storageCostPerGB: 0.023,   // Baseline
                networkCostPerGB: 0.09,    // Baseline
                region: 'us-east-1'
            };

            const result = analyzer.analyzeCost(metrics);

            expect(result.score).toBeCloseTo(50, 1); // Baseline should score around 50
            expect(result.category).toBe('moderate');
            expect(result.relativeCostIndex).toBeCloseTo(1.0, 1);
            expect(result.confidence).toBeGreaterThan(0.8);
            expect(result.reasoning).toContain('1.00x market baseline');
        });

        it('should score very affordable regions highly', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: 0.06,  // 60% of baseline
                storageCostPerGB: 0.015,   // 65% of baseline
                networkCostPerGB: 0.05,    // 56% of baseline
                region: 'us-west-2'
            };

            const result = analyzer.analyzeCost(metrics);

            expect(result.score).toBeGreaterThan(65); // Should score well
            expect(result.category).toBe('very_affordable');
            expect(result.relativeCostIndex).toBeLessThan(0.7);
            expect(result.reasoning).toContain('exceptional value');
        });

        it('should penalize expensive regions', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: 0.20,  // 2x baseline
                storageCostPerGB: 0.05,    // ~2.2x baseline
                networkCostPerGB: 0.18,    // 2x baseline
                region: 'ap-southeast-1'
            };

            const result = analyzer.analyzeCost(metrics);

            expect(result.score).toBeLessThan(30); // Should score poorly
            expect(result.category).toBe('expensive');
            expect(result.relativeCostIndex).toBeGreaterThan(1.5);
            expect(result.reasoning).toContain('premium pricing');
        });

        it('should handle mixed cost dimensions correctly', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: 0.05,  // Very cheap compute
                storageCostPerGB: 0.023,   // Baseline storage
                networkCostPerGB: 0.15,    // Expensive network
                region: 'eu-west-1'
            };

            const result = analyzer.analyzeCost(metrics);

            expect(result.category).toBe('affordable'); // Should average out to affordable
            expect(result.reasoning).toContain('Network costs create notable pricing pressure');
        });

        it('should detect and penalize zero costs', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: 0.0,   // Suspicious zero cost
                storageCostPerGB: 0.023,
                networkCostPerGB: 0.09,
                region: 'test-region'
            };

            const result = analyzer.analyzeCost(metrics);

            expect(result.confidence).toBeLessThan(0.8); // Should reduce confidence
        });

        it('should detect mock data and reduce confidence', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: 0.10,
                storageCostPerGB: 0.023,
                networkCostPerGB: 0.09,
                region: 'mock-region'
            };

            const result = analyzer.analyzeCost(metrics);

            expect(result.confidence).toBeLessThan(0.5); // Heavy penalty for mock data
        });

        it('should handle extreme costs with reduced confidence', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: 1.0,   // 10x baseline - extreme
                storageCostPerGB: 0.5,     // ~22x baseline - extreme
                networkCostPerGB: 0.9,     // 10x baseline - extreme
                region: 'extreme-region'
            };

            const result = analyzer.analyzeCost(metrics);

            expect(result.confidence).toBeLessThan(0.7); // Should reduce confidence for extreme costs
            expect(result.category).toBe('expensive');
        });
    });

    describe('input validation', () => {
        it('should reject negative compute costs', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: -0.05,
                storageCostPerGB: 0.023,
                networkCostPerGB: 0.09,
                region: 'us-east-1'
            };

            expect(() => analyzer.analyzeCost(metrics)).toThrow('Invalid compute cost');
        });

        it('should reject invalid storage costs', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: 0.10,
                storageCostPerGB: 2.0, // Too high
                networkCostPerGB: 0.09,
                region: 'us-east-1'
            };

            expect(() => analyzer.analyzeCost(metrics)).toThrow('Invalid storage cost');
        });

        it('should reject missing region', () => {
            const metrics: CostMetrics = {
                computeCostPerHour: 0.10,
                storageCostPerGB: 0.023,
                networkCostPerGB: 0.09,
                region: ''
            };

            expect(() => analyzer.analyzeCost(metrics)).toThrow('Cost metrics must specify a region');
        });
    });

    describe('utility methods', () => {
        it('should provide access to thresholds', () => {
            const thresholds = analyzer.getThresholds();

            expect(thresholds.veryAffordable).toBe(0.7);
            expect(thresholds.affordable).toBe(0.9);
            expect(thresholds.moderate).toBe(1.2);
            expect(thresholds.extremeMultiplier).toBe(5.0);
        });

        it('should provide access to baselines', () => {
            const baselines = analyzer.getBaselines();

            expect(baselines.compute).toBe(0.10);
            expect(baselines.storage).toBe(0.023);
            expect(baselines.network).toBe(0.09);
        });

        it('should provide access to weights', () => {
            const weights = analyzer.getWeights();

            expect(weights.compute).toBe(0.5);
            expect(weights.storage).toBe(0.3);
            expect(weights.network).toBe(0.2);
            expect(weights.compute + weights.storage + weights.network).toBe(1.0);
        });
    });
});