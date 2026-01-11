import { RegionVerdictGenerator } from '../VerdictGenerator';
import { CompositeScore, CloudRegion, LatencyScore, CarbonScore, CostScore } from '../../types/index';

describe('RegionVerdictGenerator - Referee Verdicts', () => {
    let verdictGenerator: RegionVerdictGenerator;
    let mockRegion: CloudRegion;

    beforeEach(() => {
        verdictGenerator = new RegionVerdictGenerator();
        mockRegion = {
            provider: 'AWS',
            regionCode: 'us-west-2',
            displayName: 'US West (Oregon)',
            location: {
                country: 'United States',
                city: 'Oregon',
                latitude: 45.5152,
                longitude: -122.6784
            }
        };
    });

    const createMockCompositeScore = (overallScore: number): CompositeScore => ({
        overallScore,
        weightedBreakdown: {
            latency: overallScore * 0.4,
            carbon: overallScore * 0.4,
            cost: overallScore * 0.2
        },
        confidence: 0.9
    });

    const createMockLatencyScore = (score: number): LatencyScore => ({
        score,
        confidence: 0.9,
        reasoning: `Latency analysis: ${score}/100`,
        category: score >= 70 ? 'excellent' : score >= 50 ? 'good' : score >= 30 ? 'acceptable' : 'poor'
    });

    const createMockCarbonScore = (score: number): CarbonScore => ({
        score,
        confidence: 0.9,
        reasoning: `Carbon analysis: ${score}/100`,
        category: score >= 70 ? 'very_clean' : score >= 50 ? 'clean' : score >= 30 ? 'moderate' : 'high_carbon',
        renewablePercentage: score * 0.8 // Approximate correlation
    });

    const createMockCostScore = (score: number): CostScore => ({
        score,
        confidence: 0.9,
        reasoning: `Cost analysis: ${score}/100`,
        category: score >= 70 ? 'very_affordable' : score >= 50 ? 'affordable' : score >= 30 ? 'moderate' : 'expensive',
        relativeCostIndex: 2 - (score / 50) // Inverse relationship
    });

    describe('Verdict Thresholds', () => {
        it('should issue Red Card for scores < 40', () => {
            const score = createMockCompositeScore(35);
            const individualScores = {
                latency: createMockLatencyScore(40),
                carbon: createMockCarbonScore(40),
                cost: createMockCostScore(40)
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.verdict).toBe('Red Card');
            expect(verdict.reason).toContain('Red Card');
            expect(verdict.reason).toContain('35/100');
        });

        it('should issue Yellow Card for scores 40-70', () => {
            const score = createMockCompositeScore(55);
            const individualScores = {
                latency: createMockLatencyScore(50),
                carbon: createMockCarbonScore(60),
                cost: createMockCostScore(55)
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.verdict).toBe('Yellow Card');
            expect(verdict.reason).toContain('Yellow Card');
            expect(verdict.reason).toContain('55/100');
            expect(verdict.reason).toContain('mixed performance');
        });

        it('should issue Play On for scores > 70', () => {
            const score = createMockCompositeScore(85);
            const individualScores = {
                latency: createMockLatencyScore(80),
                carbon: createMockCarbonScore(90),
                cost: createMockCostScore(85)
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.verdict).toBe('Play On');
            expect(verdict.reason).toContain('Play On');
            expect(verdict.reason).toContain('85/100');
            expect(verdict.reason).toContain('approves this choice');
        });
    });

    describe('Red Card Rule - Individual Factor < 30', () => {
        it('should issue Red Card when latency score < 30 (regardless of overall score)', () => {
            const score = createMockCompositeScore(75); // Would normally be Play On
            const individualScores = {
                latency: createMockLatencyScore(25), // Triggers Red Card
                carbon: createMockCarbonScore(90),
                cost: createMockCostScore(90)
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.verdict).toBe('Red Card');
            expect(verdict.reason).toContain('latency performance is critically poor');
        });

        it('should issue Red Card when carbon score < 30 (regardless of overall score)', () => {
            const score = createMockCompositeScore(75); // Would normally be Play On
            const individualScores = {
                latency: createMockLatencyScore(90),
                carbon: createMockCarbonScore(25), // Triggers Red Card
                cost: createMockCostScore(90)
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.verdict).toBe('Red Card');
            expect(verdict.reason).toContain('carbon intensity is unacceptably high');
            expect(verdict.reason).toContain('cannot sanction this environmental cost');
        });

        it('should issue Red Card when cost score < 30 (regardless of overall score)', () => {
            const score = createMockCompositeScore(75); // Would normally be Play On
            const individualScores = {
                latency: createMockLatencyScore(90),
                carbon: createMockCarbonScore(90),
                cost: createMockCostScore(25) // Triggers Red Card
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.verdict).toBe('Red Card');
            expect(verdict.reason).toContain('cost structure is prohibitively expensive');
            expect(verdict.reason).toContain('lacks financial justification');
        });
    });

    describe('Referee Tone and Messaging', () => {
        it('should use authoritative referee language', () => {
            const score = createMockCompositeScore(55);
            const individualScores = {
                latency: createMockLatencyScore(50),
                carbon: createMockCarbonScore(60),
                cost: createMockCostScore(55)
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.reason).toContain('The Referee has reviewed');
            expect(verdict.reason).toMatch(/Carbon: \d+pts/);
            expect(verdict.reason).toMatch(/Latency: \d+pts/);
            expect(verdict.reason).toMatch(/Cost: \d+pts/);
        });

        it('should emphasize ethical costs in Red Card verdicts', () => {
            const score = createMockCompositeScore(75);
            const individualScores = {
                latency: createMockLatencyScore(90),
                carbon: createMockCarbonScore(25), // Environmental Red Card
                cost: createMockCostScore(90)
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.reason).toContain('cannot sanction this environmental cost');
            expect(verdict.reason).toContain('strongly advises against');
        });

        it('should mention pragmatic balance in Play On verdicts', () => {
            const score = createMockCompositeScore(85);
            const individualScores = {
                latency: createMockLatencyScore(80),
                carbon: createMockCarbonScore(90),
                cost: createMockCostScore(85)
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.reason).toContain('pragmatic balance');
            expect(verdict.reason).toContain('performance and sustainability');
        });
    });

    describe('Green Suggestions', () => {
        it('should always provide a green suggestion', () => {
            const score = createMockCompositeScore(55);
            const verdict = verdictGenerator.generateVerdict(score, mockRegion);

            expect(verdict.suggestion).toBeDefined();
            expect(verdict.suggestion.type).toBeDefined();
            expect(verdict.suggestion.description).toBeDefined();
            expect(verdict.suggestion.description.length).toBeGreaterThan(0);
        });

        it('should mention Pragmatic Green choice in suggestions when alternatives exist', () => {
            const score = createMockCompositeScore(55);

            // Create mock available regions and scores for alternative region suggestion
            const availableRegions = [
                mockRegion,
                {
                    provider: 'AWS' as const,
                    regionCode: 'eu-west-1',
                    displayName: 'EU West (Ireland)',
                    location: {
                        country: 'Ireland',
                        city: 'Dublin',
                        latitude: 53.3498,
                        longitude: -6.2603
                    }
                }
            ];

            const regionScores = new Map([
                [mockRegion.regionCode, {
                    carbon: createMockCarbonScore(40),
                    latency: createMockLatencyScore(60),
                    cost: createMockCostScore(50)
                }],
                ['eu-west-1', {
                    carbon: createMockCarbonScore(80), // Better carbon score
                    latency: createMockLatencyScore(55), // Acceptable latency
                    cost: createMockCostScore(45)
                }]
            ]);

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, undefined, availableRegions, regionScores);

            expect(verdict.suggestion.description).toContain('Pragmatic Green');
            expect(verdict.suggestion.type).toBe('alternative_region');
        });

        it('should provide optimization strategy when no better alternatives exist', () => {
            const score = createMockCompositeScore(55);
            const verdict = verdictGenerator.generateVerdict(score, mockRegion);

            expect(verdict.suggestion.description).toContain('optimization strategies');
            expect(verdict.suggestion.type).toBe('optimization_strategy');
        });

        it('should provide expected impact information', () => {
            const score = createMockCompositeScore(55);
            const verdict = verdictGenerator.generateVerdict(score, mockRegion);

            expect(verdict.suggestion.expectedImpact).toBeDefined();
            expect(verdict.suggestion.expectedImpact).toContain('carbon footprint');
        });
    });

    describe('Verdict Structure', () => {
        it('should include all required fields in verdict', () => {
            const score = createMockCompositeScore(55);
            const individualScores = {
                latency: createMockLatencyScore(50),
                carbon: createMockCarbonScore(60),
                cost: createMockCostScore(55)
            };

            const verdict = verdictGenerator.generateVerdict(score, mockRegion, individualScores);

            expect(verdict.region).toEqual(mockRegion);
            expect(verdict.verdict).toBeDefined();
            expect(verdict.reason).toBeDefined();
            expect(verdict.suggestion).toBeDefined();
            expect(verdict.scores).toBeDefined();
            expect(verdict.scores.latency).toEqual(individualScores.latency);
            expect(verdict.scores.carbon).toEqual(individualScores.carbon);
            expect(verdict.scores.cost).toEqual(individualScores.cost);
            expect(verdict.scores.composite).toEqual(score);
            expect(verdict.timestamp).toBeInstanceOf(Date);
        });

        it('should handle missing individual scores with defaults', () => {
            const score = createMockCompositeScore(55);
            const verdict = verdictGenerator.generateVerdict(score, mockRegion);

            expect(verdict.scores.latency.score).toBe(50);
            expect(verdict.scores.carbon.score).toBe(50);
            expect(verdict.scores.cost.score).toBe(50);
            expect(verdict.scores.latency.reasoning).toContain('Default');
            expect(verdict.scores.carbon.reasoning).toContain('Default');
            expect(verdict.scores.cost.reasoning).toContain('Default');
        });
    });
});