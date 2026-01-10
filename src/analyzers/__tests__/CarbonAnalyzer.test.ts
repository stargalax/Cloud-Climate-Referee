import { RegionCarbonAnalyzer } from '../CarbonAnalyzer';
import { CarbonMetrics } from '../../types/index';

describe('RegionCarbonAnalyzer', () => {
    let analyzer: RegionCarbonAnalyzer;

    beforeEach(() => {
        analyzer = new RegionCarbonAnalyzer();
    });

    describe('analyzeCarbonImpact', () => {
        it('should score very clean energy correctly', () => {
            const metrics: CarbonMetrics = {
                carbonIntensity: 50, // Very low
                renewablePercentage: 90, // Very high
                dataSource: 'electricitymaps',
                lastUpdated: new Date()
            };

            const result = analyzer.analyzeCarbonImpact(metrics);

            expect(result.score).toBeGreaterThan(90); // Should be very high score
            expect(result.category).toBe('very_clean');
            expect(result.renewablePercentage).toBe(90);
            expect(result.confidence).toBeGreaterThan(0.8);
            expect(result.reasoning).toContain('exemplary environmental stewardship');
        });

        it('should score high carbon regions poorly', () => {
            const metrics: CarbonMetrics = {
                carbonIntensity: 450, // Very high
                renewablePercentage: 15, // Very low
                dataSource: 'electricitymaps',
                lastUpdated: new Date()
            };

            const result = analyzer.analyzeCarbonImpact(metrics);

            expect(result.score).toBeLessThan(30); // Should be very low score
            expect(result.category).toBe('high_carbon');
            expect(result.reasoning).toContain('significant environmental cost');
        });

        it('should apply renewable energy bonus correctly', () => {
            const baseMetrics: CarbonMetrics = {
                carbonIntensity: 200,
                renewablePercentage: 30,
                dataSource: 'electricitymaps',
                lastUpdated: new Date()
            };

            const highRenewableMetrics: CarbonMetrics = {
                ...baseMetrics,
                renewablePercentage: 85
            };

            const baseResult = analyzer.analyzeCarbonImpact(baseMetrics);
            const highRenewableResult = analyzer.analyzeCarbonImpact(highRenewableMetrics);

            expect(highRenewableResult.score).toBeGreaterThan(baseResult.score);
        });

        it('should reduce confidence for stale data', () => {
            const freshMetrics: CarbonMetrics = {
                carbonIntensity: 200,
                renewablePercentage: 50,
                dataSource: 'electricitymaps',
                lastUpdated: new Date()
            };

            const staleMetrics: CarbonMetrics = {
                ...freshMetrics,
                lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
            };

            const freshResult = analyzer.analyzeCarbonImpact(freshMetrics);
            const staleResult = analyzer.analyzeCarbonImpact(staleMetrics);

            expect(staleResult.confidence).toBeLessThan(freshResult.confidence);
        });

        it('should reduce confidence for untrusted data sources', () => {
            const trustedMetrics: CarbonMetrics = {
                carbonIntensity: 200,
                renewablePercentage: 50,
                dataSource: 'electricitymaps',
                lastUpdated: new Date()
            };

            const untrustedMetrics: CarbonMetrics = {
                ...trustedMetrics,
                dataSource: 'unknown-source'
            };

            const trustedResult = analyzer.analyzeCarbonImpact(trustedMetrics);
            const untrustedResult = analyzer.analyzeCarbonImpact(untrustedMetrics);

            expect(untrustedResult.confidence).toBeLessThan(trustedResult.confidence);
        });

        it('should handle edge case: zero carbon intensity', () => {
            const metrics: CarbonMetrics = {
                carbonIntensity: 0,
                renewablePercentage: 100,
                dataSource: 'electricitymaps',
                lastUpdated: new Date()
            };

            const result = analyzer.analyzeCarbonImpact(metrics);

            expect(result.score).toBe(100); // Perfect score
            expect(result.category).toBe('very_clean');
        });

        it('should handle edge case: maximum carbon intensity', () => {
            const metrics: CarbonMetrics = {
                carbonIntensity: 500,
                renewablePercentage: 0,
                dataSource: 'electricitymaps',
                lastUpdated: new Date()
            };

            const result = analyzer.analyzeCarbonImpact(metrics);

            expect(result.score).toBeLessThan(10); // Very low score
            expect(result.category).toBe('high_carbon');
        });
    });

    describe('input validation', () => {
        it('should throw error for invalid carbon intensity', () => {
            const metrics: CarbonMetrics = {
                carbonIntensity: -50, // Invalid
                renewablePercentage: 50,
                dataSource: 'electricitymaps',
                lastUpdated: new Date()
            };

            expect(() => analyzer.analyzeCarbonImpact(metrics)).toThrow('Invalid carbon intensity');
        });

        it('should throw error for invalid renewable percentage', () => {
            const metrics: CarbonMetrics = {
                carbonIntensity: 200,
                renewablePercentage: 150, // Invalid
                dataSource: 'electricitymaps',
                lastUpdated: new Date()
            };

            expect(() => analyzer.analyzeCarbonImpact(metrics)).toThrow('Invalid renewable percentage');
        });

        it('should throw error for missing data source', () => {
            const metrics: CarbonMetrics = {
                carbonIntensity: 200,
                renewablePercentage: 50,
                dataSource: '', // Invalid
                lastUpdated: new Date()
            };

            expect(() => analyzer.analyzeCarbonImpact(metrics)).toThrow('Carbon data source must be specified');
        });
    });

    describe('utility methods', () => {
        it('should return correct thresholds', () => {
            const thresholds = analyzer.getThresholds();

            expect(thresholds.veryClean).toBe(100);
            expect(thresholds.clean).toBe(200);
            expect(thresholds.moderate).toBe(350);
            expect(thresholds.maxIntensity).toBe(500);
        });

        it('should return correct renewable thresholds', () => {
            const renewableThresholds = analyzer.getRenewableThresholds();

            expect(renewableThresholds.high).toBe(80);
            expect(renewableThresholds.good).toBe(50);
            expect(renewableThresholds.low).toBe(20);
        });
    });
});