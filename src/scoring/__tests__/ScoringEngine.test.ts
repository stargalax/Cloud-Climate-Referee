import { RegionScoringEngine } from '../ScoringEngine';
import { LatencyScore, CarbonScore, CostScore } from '../../types/index';

describe('RegionScoringEngine - Referee Logic', () => {
    let scoringEngine: RegionScoringEngine;

    beforeEach(() => {
        scoringEngine = new RegionScoringEngine();
    });

    describe('Carbon Score Normalization', () => {
        it('should give 100 points for 0g CO2/kWh', () => {
            expect(scoringEngine.normalizeCarbonScore(0)).toBe(100);
        });

        it('should give 0 points for 500g CO2/kWh', () => {
            expect(scoringEngine.normalizeCarbonScore(500)).toBe(0);
        });

        it('should give 50 points for 250g CO2/kWh (midpoint)', () => {
            expect(scoringEngine.normalizeCarbonScore(250)).toBe(50);
        });

        it('should cap at 0 for values above 500g', () => {
            expect(scoringEngine.normalizeCarbonScore(600)).toBe(0);
        });
    });

    describe('Latency Score Normalization', () => {
        it('should give 100 points for 0ms latency', () => {
            expect(scoringEngine.normalizeLatencyScore(0)).toBe(100);
        });

        it('should give 0 points for 200ms latency', () => {
            expect(scoringEngine.normalizeLatencyScore(200)).toBe(0);
        });

        it('should give 50 points for 100ms latency (midpoint)', () => {
            expect(scoringEngine.normalizeLatencyScore(100)).toBe(50);
        });

        it('should cap at 0 for values above 200ms', () => {
            expect(scoringEngine.normalizeLatencyScore(300)).toBe(0);
        });
    });

    describe('Cost Score Normalization', () => {
        it('should give 100 points for very cheap costs (half baseline)', () => {
            expect(scoringEngine.normalizeCostScore(0.05, 0.10)).toBe(100);
        });

        it('should give 0 points for very expensive costs (double baseline)', () => {
            expect(scoringEngine.normalizeCostScore(0.20, 0.10)).toBe(0);
        });

        it('should give ~67 points for baseline cost', () => {
            const score = scoringEngine.normalizeCostScore(0.10, 0.10);
            expect(score).toBeCloseTo(66.67, 1);
        });
    });

    describe('Red Card Rule', () => {
        const createMockScore = (score: number): LatencyScore => ({
            score,
            confidence: 0.9,
            reasoning: 'test',
            category: 'good'
        });

        const createMockCarbonScore = (score: number): CarbonScore => ({
            score,
            confidence: 0.9,
            reasoning: 'test',
            category: 'clean',
            renewablePercentage: 50
        });

        const createMockCostScore = (score: number): CostScore => ({
            score,
            confidence: 0.9,
            reasoning: 'test',
            category: 'affordable',
            relativeCostIndex: 1.0
        });

        it('should trigger Red Card when latency score < 30', () => {
            const latency = createMockScore(25);
            const carbon = createMockCarbonScore(80);
            const cost = createMockCostScore(70);

            expect(scoringEngine.isRedCardScore(latency, carbon, cost)).toBe(true);
            expect(scoringEngine.getRedCardFactor(latency, carbon, cost)).toBe('latency');
        });

        it('should trigger Red Card when carbon score < 30', () => {
            const latency = createMockScore(80);
            const carbon = createMockCarbonScore(25);
            const cost = createMockCostScore(70);

            expect(scoringEngine.isRedCardScore(latency, carbon, cost)).toBe(true);
            expect(scoringEngine.getRedCardFactor(latency, carbon, cost)).toBe('carbon');
        });

        it('should trigger Red Card when cost score < 30', () => {
            const latency = createMockScore(80);
            const carbon = createMockCarbonScore(70);
            const cost = createMockCostScore(25);

            expect(scoringEngine.isRedCardScore(latency, carbon, cost)).toBe(true);
            expect(scoringEngine.getRedCardFactor(latency, carbon, cost)).toBe('cost');
        });

        it('should NOT trigger Red Card when all scores >= 30', () => {
            const latency = createMockScore(40);
            const carbon = createMockCarbonScore(50);
            const cost = createMockCostScore(60);

            expect(scoringEngine.isRedCardScore(latency, carbon, cost)).toBe(false);
            expect(scoringEngine.getRedCardFactor(latency, carbon, cost)).toBe(null);
        });
    });

    describe('Composite Score Calculation', () => {
        it('should use correct weights (40% Carbon, 40% Latency, 20% Cost)', () => {
            const latency: LatencyScore = {
                score: 50,
                confidence: 0.9,
                reasoning: 'test',
                category: 'good'
            };

            const carbon: CarbonScore = {
                score: 60,
                confidence: 0.9,
                reasoning: 'test',
                category: 'clean',
                renewablePercentage: 50
            };

            const cost: CostScore = {
                score: 70,
                confidence: 0.9,
                reasoning: 'test',
                category: 'affordable',
                relativeCostIndex: 1.0
            };

            const result = scoringEngine.combineScores(latency, carbon, cost);

            // Expected: (50 * 0.4) + (60 * 0.4) + (70 * 0.2) = 20 + 24 + 14 = 58
            expect(result.overallScore).toBe(58);
            expect(result.weightedBreakdown.latency).toBe(20);
            expect(result.weightedBreakdown.carbon).toBe(24);
            expect(result.weightedBreakdown.cost).toBe(14);
        });

        it('should cap overall score when Red Card Rule is triggered', () => {
            const latency: LatencyScore = {
                score: 25, // Below 30 - triggers Red Card
                confidence: 0.9,
                reasoning: 'test',
                category: 'poor'
            };

            const carbon: CarbonScore = {
                score: 90,
                confidence: 0.9,
                reasoning: 'test',
                category: 'very_clean',
                renewablePercentage: 80
            };

            const cost: CostScore = {
                score: 80,
                confidence: 0.9,
                reasoning: 'test',
                category: 'affordable',
                relativeCostIndex: 0.8
            };

            const result = scoringEngine.combineScores(latency, carbon, cost);

            // Even though weighted score would be higher, Red Card caps it at 29
            expect(result.overallScore).toBeLessThan(30);
        });
    });
});