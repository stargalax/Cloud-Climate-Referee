import { RegionLatencyAnalyzer } from '../LatencyAnalyzer';
import { LatencyMetrics } from '../../types/index';

describe('RegionLatencyAnalyzer - Static Baseline + Ping Confidence', () => {
    let analyzer: RegionLatencyAnalyzer;

    beforeEach(() => {
        analyzer = new RegionLatencyAnalyzer();
    });

    describe('Static Latency Map', () => {
        it('should have baseline data for major AWS regions', () => {
            expect(analyzer.getRegionBaseline('us-east-1')).toEqual({
                baselineLatency: 25,
                p95Latency: 35,
                description: 'US East (Virginia)'
            });

            expect(analyzer.getRegionBaseline('eu-west-1')).toEqual({
                baselineLatency: 85,
                p95Latency: 120,
                description: 'Europe (Ireland)'
            });

            expect(analyzer.getRegionBaseline('ap-southeast-1')).toEqual({
                baselineLatency: 180,
                p95Latency: 250,
                description: 'Asia Pacific (Singapore)'
            });
        });

        it('should return null for unknown regions', () => {
            expect(analyzer.getRegionBaseline('unknown-region')).toBeNull();
        });

        it('should list all available regions', () => {
            const regions = analyzer.getAvailableRegions();
            expect(regions).toContain('us-east-1');
            expect(regions).toContain('eu-west-1');
            expect(regions).toContain('ap-southeast-1');
            expect(regions.length).toBeGreaterThan(15); // Should have many regions
        });
    });

    describe('Baseline-Based Scoring', () => {
        it('should score based on baseline latency, not real ping', () => {
            // US East region with baseline 25ms should score ~87.5
            const metrics: LatencyMetrics = {
                averageLatency: 100, // Real ping is much higher
                p95Latency: 150,
                measurementTimestamp: new Date(),
                sourceLocation: 'mock-us-east-1'
            };

            const result = analyzer.analyzeLatency(metrics);

            // Score should be based on baseline (25ms), not real ping (100ms)
            // 25ms baseline = 100 - (25/200)*100 = 87.5 points
            expect(result.score).toBeCloseTo(87.5, 1);
            expect(result.category).toBe('excellent'); // Based on 25ms baseline
        });

        it('should use baseline for Asia Pacific regions', () => {
            const metrics: LatencyMetrics = {
                averageLatency: 50, // Real ping is much better
                p95Latency: 75,
                measurementTimestamp: new Date(),
                sourceLocation: 'mock-ap-southeast-1'
            };

            const result = analyzer.analyzeLatency(metrics);

            // Score should be based on baseline (180ms), not real ping (50ms)
            // 180ms baseline = 100 - (180/200)*100 = 10 points
            expect(result.score).toBeCloseTo(10, 1);
            expect(result.category).toBe('poor'); // Based on 180ms baseline
        });
    });

    describe('Confidence Calculation with Ping Validation', () => {
        it('should have high confidence when real ping matches baseline', () => {
            const metrics: LatencyMetrics = {
                averageLatency: 25, // Matches us-east-1 baseline exactly
                p95Latency: 35,
                measurementTimestamp: new Date(),
                sourceLocation: 'real-us-east-1' // Use non-mock source
            };

            const result = analyzer.analyzeLatency(metrics);

            expect(result.confidence).toBeGreaterThan(0.9);
            expect(result.reasoning).toContain('confirms baseline expectations');
        });

        it('should reduce confidence when real ping differs significantly from baseline', () => {
            const metrics: LatencyMetrics = {
                averageLatency: 100, // 4x higher than us-east-1 baseline (25ms)
                p95Latency: 150,
                measurementTimestamp: new Date(),
                sourceLocation: 'mock-us-east-1'
            };

            const result = analyzer.analyzeLatency(metrics);

            expect(result.confidence).toBeLessThan(0.6);
            expect(result.reasoning).toContain('higher than expected, reducing confidence');
        });

        it('should heavily penalize mock data confidence', () => {
            const metrics: LatencyMetrics = {
                averageLatency: 25,
                p95Latency: 35,
                measurementTimestamp: new Date(),
                sourceLocation: 'mock-us-east-1' // Contains 'mock'
            };

            const result = analyzer.analyzeLatency(metrics);

            expect(result.confidence).toBeLessThan(0.5); // Should be heavily penalized
        });

        it('should reduce confidence for stale data', () => {
            const oldTimestamp = new Date();
            oldTimestamp.setHours(oldTimestamp.getHours() - 48); // 48 hours old

            const metrics: LatencyMetrics = {
                averageLatency: 25,
                p95Latency: 35,
                measurementTimestamp: oldTimestamp,
                sourceLocation: 'real-us-east-1'
            };

            const result = analyzer.analyzeLatency(metrics);

            expect(result.confidence).toBeLessThan(0.8);
        });
    });

    describe('Performance Categories', () => {
        it('should categorize based on baseline latency', () => {
            // Test excellent performance (us-east-1: 25ms baseline)
            const excellentMetrics: LatencyMetrics = {
                averageLatency: 200, // Real ping doesn't matter for category
                p95Latency: 300,
                measurementTimestamp: new Date(),
                sourceLocation: 'mock-us-east-1'
            };

            const excellentResult = analyzer.analyzeLatency(excellentMetrics);
            expect(excellentResult.category).toBe('excellent');

            // Test poor performance (ap-southeast-1: 180ms baseline)
            const poorMetrics: LatencyMetrics = {
                averageLatency: 10, // Real ping doesn't matter for category
                p95Latency: 15,
                measurementTimestamp: new Date(),
                sourceLocation: 'mock-ap-southeast-1'
            };

            const poorResult = analyzer.analyzeLatency(poorMetrics);
            expect(poorResult.category).toBe('poor');
        });
    });

    describe('Reasoning Generation', () => {
        it('should explain baseline-based assessment', () => {
            const metrics: LatencyMetrics = {
                averageLatency: 50,
                p95Latency: 75,
                measurementTimestamp: new Date(),
                sourceLocation: 'mock-us-east-1'
            };

            const result = analyzer.analyzeLatency(metrics);

            expect(result.reasoning).toContain('US East (Virginia) baseline latency of 25ms');
            expect(result.reasoning).toContain('exceptional global performance');
            expect(result.reasoning).toContain('Real measurement of 50ms');
        });

        it('should handle unknown regions with fallback', () => {
            const metrics: LatencyMetrics = {
                averageLatency: 80,
                p95Latency: 120,
                measurementTimestamp: new Date(),
                sourceLocation: 'mock-unknown-region'
            };

            const result = analyzer.analyzeLatency(metrics);

            expect(result.reasoning).toContain('Unknown region (estimated)');
            expect(result.reasoning).toContain('baseline latency of 100ms');
        });
    });

    describe('Referee Normalization', () => {
        it('should use correct normalization (0ms = 100pts, 200ms = 0pts)', () => {
            // Create a custom analyzer instance to test normalization directly
            const testAnalyzer = new RegionLatencyAnalyzer();

            // Add a test region with 0ms baseline to the static map
            (testAnalyzer as any).STATIC_LATENCY_MAP['test-zero-region'] = {
                baselineLatency: 0,
                p95Latency: 0,
                description: 'Test Zero Latency'
            };

            const zeroLatencyMetrics: LatencyMetrics = {
                averageLatency: 1000, // Real ping doesn't affect score
                p95Latency: 1500,
                measurementTimestamp: new Date(),
                sourceLocation: 'test-zero-region'
            };

            const result = testAnalyzer.analyzeLatency(zeroLatencyMetrics);
            expect(result.score).toBe(100);
        });
    });
});