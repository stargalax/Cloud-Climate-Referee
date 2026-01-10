import {
    ScoringEngine,
    LatencyScore,
    CarbonScore,
    CostScore,
    CompositeScore,
    FactorWeights
} from '../types/index.js';

/**
 * Referee Scoring Engine - Implements the official scoring logic
 * 
 * Normalization Rules:
 * - Carbon: 0g CO2/kWh = 100pts, 500g CO2/kWh = 0pts
 * - Latency: 0ms = 100pts, 200ms = 0pts
 * - Cost: Relative scoring based on regional baselines
 * 
 * Weights: Carbon 40%, Latency 40%, Cost 20%
 * Red Card Rule: Any individual factor < 30pts = Automatic Red Card
 */
export class RegionScoringEngine implements ScoringEngine {
    private readonly CARBON_MAX = 500; // gCO2/kWh
    private readonly LATENCY_MAX = 200; // milliseconds
    private readonly RED_CARD_THRESHOLD = 30; // points

    private readonly DEFAULT_WEIGHTS: FactorWeights = {
        carbon: 0.4,   // 40%
        latency: 0.4,  // 40%
        cost: 0.2      // 20%
    };

    /**
     * Combine individual factor scores into a composite score using Referee logic
     */
    combineScores(
        latency: LatencyScore,
        carbon: CarbonScore,
        cost: CostScore,
        weights: FactorWeights = this.DEFAULT_WEIGHTS
    ): CompositeScore {
        // Validate weights sum to 1.0
        const weightSum = weights.carbon + weights.latency + weights.cost;
        if (Math.abs(weightSum - 1.0) > 0.001) {
            throw new Error(`Weights must sum to 1.0, got ${weightSum}`);
        }

        // Check Red Card Rule: Any individual score < 30 = Automatic Red Card
        const hasRedCardFactor = latency.score < this.RED_CARD_THRESHOLD ||
            carbon.score < this.RED_CARD_THRESHOLD ||
            cost.score < this.RED_CARD_THRESHOLD;

        // Calculate weighted breakdown
        const weightedBreakdown = {
            latency: latency.score * weights.latency,
            carbon: carbon.score * weights.carbon,
            cost: cost.score * weights.cost
        };

        // Calculate overall score
        const overallScore = weightedBreakdown.latency +
            weightedBreakdown.carbon +
            weightedBreakdown.cost;

        // Calculate composite confidence (minimum of all factor confidences)
        const confidence = Math.min(latency.confidence, carbon.confidence, cost.confidence);

        // If Red Card Rule triggered, cap the overall score
        const finalScore = hasRedCardFactor ?
            Math.min(overallScore, this.RED_CARD_THRESHOLD - 1) :
            overallScore;

        return {
            overallScore: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
            weightedBreakdown,
            confidence
        };
    }

    /**
     * Normalize carbon intensity score using Referee logic
     * 0g CO2/kWh = 100pts, 500g CO2/kWh = 0pts
     */
    normalizeCarbonScore(carbonIntensity: number): number {
        if (carbonIntensity <= 0) return 100;
        if (carbonIntensity >= this.CARBON_MAX) return 0;

        // Linear interpolation: score = 100 - (intensity / max) * 100
        const score = 100 - (carbonIntensity / this.CARBON_MAX) * 100;
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Normalize latency score using Referee logic
     * 0ms = 100pts, 200ms = 0pts
     */
    normalizeLatencyScore(latencyMs: number): number {
        if (latencyMs <= 0) return 100;
        if (latencyMs >= this.LATENCY_MAX) return 0;

        // Linear interpolation: score = 100 - (latency / max) * 100
        const score = 100 - (latencyMs / this.LATENCY_MAX) * 100;
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Normalize cost score using relative pricing
     * Lower costs get higher scores
     */
    normalizeCostScore(costPerHour: number, baselineCost: number = 0.10): number {
        if (costPerHour <= 0) return 100;

        // Relative scoring: baseline cost = 50pts, half baseline = 100pts, double baseline = 0pts
        const ratio = costPerHour / baselineCost;

        if (ratio <= 0.5) return 100; // Very cheap
        if (ratio >= 2.0) return 0;   // Very expensive

        // Linear interpolation between 0.5x and 2.0x baseline
        const score = 100 - ((ratio - 0.5) / 1.5) * 100;
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Check if a composite score triggers the Red Card Rule
     */
    isRedCardScore(latency: LatencyScore, carbon: CarbonScore, cost: CostScore): boolean {
        return latency.score < this.RED_CARD_THRESHOLD ||
            carbon.score < this.RED_CARD_THRESHOLD ||
            cost.score < this.RED_CARD_THRESHOLD;
    }

    /**
     * Get the factor that triggered the Red Card (for reasoning)
     */
    getRedCardFactor(latency: LatencyScore, carbon: CarbonScore, cost: CostScore): string | null {
        if (latency.score < this.RED_CARD_THRESHOLD) return 'latency';
        if (carbon.score < this.RED_CARD_THRESHOLD) return 'carbon';
        if (cost.score < this.RED_CARD_THRESHOLD) return 'cost';
        return null;
    }
}