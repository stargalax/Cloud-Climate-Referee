import { CloudRegionArbitrator } from '../RegionArbitrator';
import { CloudRegion, FactorWeights } from '../types/index';

describe('CloudRegionArbitrator', () => {
    let arbitrator: CloudRegionArbitrator;

    const testRegion: CloudRegion = {
        provider: 'AWS',
        regionCode: 'us-east-1',
        displayName: 'US East (Virginia)',
        location: {
            country: 'US',
            city: 'Virginia',
            latitude: 39.0458,
            longitude: -77.5091
        }
    };

    beforeEach(() => {
        arbitrator = new CloudRegionArbitrator();
    });

    describe('constructor', () => {
        it('should initialize with default weights', () => {
            const weights = arbitrator.getWeights();
            expect(weights.carbon).toBe(0.4);
            expect(weights.latency).toBe(0.4);
            expect(weights.cost).toBe(0.2);
        });

        it('should accept custom weights', () => {
            const customWeights: FactorWeights = {
                carbon: 0.5,
                latency: 0.3,
                cost: 0.2
            };
            const customArbitrator = new CloudRegionArbitrator(
                undefined, undefined, undefined, undefined, undefined, undefined,
                customWeights
            );
            expect(customArbitrator.getWeights()).toEqual(customWeights);
        });
    });

    describe('configureWeights', () => {
        it('should update weights when valid', () => {
            const newWeights: FactorWeights = {
                carbon: 0.6,
                latency: 0.2,
                cost: 0.2
            };
            arbitrator.configureWeights(newWeights);
            expect(arbitrator.getWeights()).toEqual(newWeights);
        });

        it('should throw error when weights do not sum to 1.0', () => {
            const invalidWeights: FactorWeights = {
                carbon: 0.5,
                latency: 0.3,
                cost: 0.1 // Sum = 0.9
            };
            expect(() => arbitrator.configureWeights(invalidWeights))
                .toThrow('Factor weights must sum to 1.0');
        });

        it('should throw error when weights are negative', () => {
            const invalidWeights: FactorWeights = {
                carbon: -0.1,
                latency: 0.6,
                cost: 0.5
            };
            expect(() => arbitrator.configureWeights(invalidWeights))
                .toThrow('All factor weights must be non-negative');
        });

        it('should throw error when single weight exceeds 0.8', () => {
            const invalidWeights: FactorWeights = {
                carbon: 0.9,
                latency: 0.05,
                cost: 0.05
            };
            expect(() => arbitrator.configureWeights(invalidWeights))
                .toThrow('No single factor weight should exceed 0.8');
        });
    });

    describe('evaluateRegion', () => {
        it('should return a valid verdict for a single region', async () => {
            const verdict = await arbitrator.evaluateRegion(testRegion);

            expect(verdict).toBeDefined();
            expect(verdict.region).toEqual(testRegion);
            expect(['Red Card', 'Yellow Card', 'Play On']).toContain(verdict.verdict);
            expect(verdict.reason).toBeTruthy();
            expect(verdict.suggestion).toBeDefined();
            expect(verdict.scores).toBeDefined();
            expect(verdict.timestamp).toBeInstanceOf(Date);
        });

        it('should include all required score components', async () => {
            const verdict = await arbitrator.evaluateRegion(testRegion);

            expect(verdict.scores.latency).toBeDefined();
            expect(verdict.scores.carbon).toBeDefined();
            expect(verdict.scores.cost).toBeDefined();
            expect(verdict.scores.composite).toBeDefined();

            // Check score ranges
            expect(verdict.scores.latency.score).toBeGreaterThanOrEqual(0);
            expect(verdict.scores.latency.score).toBeLessThanOrEqual(100);
            expect(verdict.scores.carbon.score).toBeGreaterThanOrEqual(0);
            expect(verdict.scores.carbon.score).toBeLessThanOrEqual(100);
            expect(verdict.scores.cost.score).toBeGreaterThanOrEqual(0);
            expect(verdict.scores.cost.score).toBeLessThanOrEqual(100);
        });
    });

    describe('evaluateMultipleRegions', () => {
        const testRegions: CloudRegion[] = [
            testRegion,
            {
                provider: 'AWS',
                regionCode: 'us-west-2',
                displayName: 'US West (Oregon)',
                location: {
                    country: 'US',
                    city: 'Oregon',
                    latitude: 45.5152,
                    longitude: -122.6784
                }
            }
        ];

        it('should return verdicts for all regions sorted by greenest first', async () => {
            const verdicts = await arbitrator.evaluateMultipleRegions(testRegions);

            expect(verdicts).toHaveLength(2);
            // Results should be sorted with greenest region first
            // Both regions should be present, but order depends on carbon scores
            const regionCodes = verdicts.map(v => v.region.regionCode);
            expect(regionCodes).toContain('us-east-1');
            expect(regionCodes).toContain('us-west-2');

            // Verify that the first region has a carbon score >= the second region
            expect(verdicts[0].scores.carbon.score).toBeGreaterThanOrEqual(verdicts[1].scores.carbon.score);
        });

        it('should return empty array for empty input', async () => {
            const verdicts = await arbitrator.evaluateMultipleRegions([]);
            expect(verdicts).toEqual([]);
        });

        it('should maintain independence between region evaluations', async () => {
            const singleVerdict = await arbitrator.evaluateRegion(testRegion);
            const multipleVerdicts = await arbitrator.evaluateMultipleRegions([testRegion]);

            // Scores should be the same (independence requirement)
            expect(multipleVerdicts[0].scores.composite.overallScore)
                .toBeCloseTo(singleVerdict.scores.composite.overallScore, 1);
        });
    });

    describe('getConfiguration', () => {
        it('should return current configuration', () => {
            const config = arbitrator.getConfiguration();

            expect(config.weights).toEqual(arbitrator.getWeights());
            expect(config.components).toBeDefined();
            expect(config.components.dataCollector).toBeTruthy();
            expect(config.components.latencyAnalyzer).toBeTruthy();
            expect(config.components.carbonAnalyzer).toBeTruthy();
            expect(config.components.costAnalyzer).toBeTruthy();
            expect(config.components.scoringEngine).toBeTruthy();
            expect(config.components.verdictGenerator).toBeTruthy();
        });
    });
});