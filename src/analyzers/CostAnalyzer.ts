import {
    CostAnalyzer,
    CostMetrics,
    CostScore
} from '../types/index';

/**
 * Cost Analysis Module
 * 
 * The Referee evaluates regions based on their financial impact across multiple dimensions:
 * compute, storage, and network costs. Uses market baseline indexing to provide
 * relative cost assessments that account for regional pricing variations.
 */
export class RegionCostAnalyzer implements CostAnalyzer {
    // Market baseline costs (USD) - representative of mid-tier pricing
    private readonly BASELINE_COMPUTE_COST = 0.10;    // USD per hour
    private readonly BASELINE_STORAGE_COST = 0.023;   // USD per GB/month
    private readonly BASELINE_NETWORK_COST = 0.09;    // USD per GB

    // Cost category thresholds (relative to baseline)
    private readonly VERY_AFFORDABLE_THRESHOLD = 0.7;  // 30% below baseline
    private readonly AFFORDABLE_THRESHOLD = 0.9;       // 10% below baseline
    private readonly MODERATE_THRESHOLD = 1.2;         // 20% above baseline

    // Dimension weights for composite cost calculation
    private readonly COMPUTE_WEIGHT = 0.5;   // 50% - typically largest cost component
    private readonly STORAGE_WEIGHT = 0.3;   // 30% - significant for data-heavy workloads
    private readonly NETWORK_WEIGHT = 0.2;   // 20% - varies by usage pattern

    private readonly MAX_DATA_AGE_HOURS = 24;  // Hours before pricing data is considered stale
    private readonly EXTREME_COST_MULTIPLIER = 5.0;  // Flag costs >5x baseline as suspicious

    /**
     * Analyze cost across multiple dimensions with relative market indexing
     */
    analyzeCost(metrics: CostMetrics): CostScore {
        // Validate input data
        this.validateCostMetrics(metrics);

        // Calculate relative cost indices for each dimension
        const computeIndex = this.calculateRelativeCostIndex(
            metrics.computeCostPerHour,
            this.BASELINE_COMPUTE_COST
        );
        const storageIndex = this.calculateRelativeCostIndex(
            metrics.storageCostPerGB,
            this.BASELINE_STORAGE_COST
        );
        const networkIndex = this.calculateRelativeCostIndex(
            metrics.networkCostPerGB,
            this.BASELINE_NETWORK_COST
        );

        // Calculate weighted composite cost index
        const compositeCostIndex = (
            computeIndex * this.COMPUTE_WEIGHT +
            storageIndex * this.STORAGE_WEIGHT +
            networkIndex * this.NETWORK_WEIGHT
        );

        // Convert cost index to score (lower cost = higher score)
        const costScore = this.normalizeCostScore(compositeCostIndex);

        // Calculate confidence based on data quality
        const confidence = this.calculateConfidence(metrics, compositeCostIndex);

        // Determine cost category
        const category = this.categorizeCost(compositeCostIndex);

        // Generate reasoning with financial context
        const reasoning = this.generateReasoning(
            metrics,
            compositeCostIndex,
            costScore,
            category,
            confidence
        );

        return {
            score: Math.round(costScore * 100) / 100,
            confidence,
            reasoning,
            category,
            relativeCostIndex: Math.round(compositeCostIndex * 100) / 100
        };
    }

    /**
     * Validate cost metrics for completeness and sanity
     */
    private validateCostMetrics(metrics: CostMetrics): void {
        if (metrics.computeCostPerHour < 0 || metrics.computeCostPerHour > 10) {
            throw new Error(`Invalid compute cost: $${metrics.computeCostPerHour}/hour`);
        }

        if (metrics.storageCostPerGB < 0 || metrics.storageCostPerGB > 1) {
            throw new Error(`Invalid storage cost: $${metrics.storageCostPerGB}/GB`);
        }

        if (metrics.networkCostPerGB < 0 || metrics.networkCostPerGB > 2) {
            throw new Error(`Invalid network cost: $${metrics.networkCostPerGB}/GB`);
        }

        if (!metrics.region || metrics.region.trim().length === 0) {
            throw new Error('Cost metrics must specify a region');
        }
    }

    /**
     * Calculate relative cost index against market baseline
     */
    private calculateRelativeCostIndex(actualCost: number, baselineCost: number): number {
        if (baselineCost === 0) {
            throw new Error('Baseline cost cannot be zero');
        }
        return actualCost / baselineCost;
    }

    /**
     * Normalize cost score - lower cost index yields higher score
     * Uses logarithmic scaling: 0.5x cost -> ~75 score, 1x cost -> 50 score, 2x cost -> ~25 score
     */
    private normalizeCostScore(costIndex: number): number {
        if (costIndex <= 0) return 100;
        if (costIndex >= 4.0) return 0;

        // Use logarithmic scaling where 1.0x cost = 50 score
        // Formula: score = 50 - (log2(costIndex) * 25)
        // This maps: 0.5x -> 75, 1x -> 50, 2x -> 25, 4x -> 0

        const logScore = 50 - (Math.log2(costIndex) * 25);
        return Math.max(0, Math.min(100, logScore));
    }

    /**
     * Calculate confidence based on data quality and consistency
     */
    private calculateConfidence(metrics: CostMetrics, compositeCostIndex: number): number {
        let confidence = 1.0;

        // Factor 1: Extreme cost detection
        if (compositeCostIndex > this.EXTREME_COST_MULTIPLIER || compositeCostIndex < 0.1) {
            confidence -= 0.4; // Significant penalty for extreme costs
        }

        // Factor 2: Cost dimension consistency
        const computeIndex = metrics.computeCostPerHour / this.BASELINE_COMPUTE_COST;
        const storageIndex = metrics.storageCostPerGB / this.BASELINE_STORAGE_COST;
        const networkIndex = metrics.networkCostPerGB / this.BASELINE_NETWORK_COST;

        // Check for inconsistent pricing across dimensions
        const maxIndex = Math.max(computeIndex, storageIndex, networkIndex);
        const minIndex = Math.min(computeIndex, storageIndex, networkIndex);
        const indexSpread = maxIndex / minIndex;

        if (indexSpread > 3.0) {
            // Large spread between dimensions suggests data quality issues
            confidence -= Math.min((indexSpread - 3.0) * 0.1, 0.3);
        }

        // Factor 3: Zero cost detection (suspicious)
        const zeroCosts = [
            metrics.computeCostPerHour,
            metrics.storageCostPerGB,
            metrics.networkCostPerGB
        ].filter(cost => cost === 0).length;

        if (zeroCosts > 0) {
            confidence -= zeroCosts * 0.2; // Penalty for each zero cost
        }

        // Factor 4: Mock or test data detection
        if (metrics.region.toLowerCase().includes('mock') ||
            metrics.region.toLowerCase().includes('test')) {
            confidence *= 0.3; // Heavy penalty for mock data
        }

        return Math.max(0.1, Math.min(1.0, confidence));
    }

    /**
     * Categorize cost performance relative to market baseline
     */
    private categorizeCost(costIndex: number): 'very_affordable' | 'affordable' | 'moderate' | 'expensive' {
        if (costIndex <= this.VERY_AFFORDABLE_THRESHOLD) {
            return 'very_affordable';
        } else if (costIndex <= this.AFFORDABLE_THRESHOLD) {
            return 'affordable';
        } else if (costIndex <= this.MODERATE_THRESHOLD) {
            return 'moderate';
        } else {
            return 'expensive';
        }
    }

    /**
     * Generate reasoning with financial context and dimension breakdown
     */
    private generateReasoning(
        metrics: CostMetrics,
        costIndex: number,
        score: number,
        category: string,
        confidence: number
    ): string {
        const computeIndex = Math.round((metrics.computeCostPerHour / this.BASELINE_COMPUTE_COST) * 100) / 100;
        const storageIndex = Math.round((metrics.storageCostPerGB / this.BASELINE_STORAGE_COST) * 100) / 100;
        const networkIndex = Math.round((metrics.networkCostPerGB / this.BASELINE_NETWORK_COST) * 100) / 100;

        let reasoning = `Multi-dimensional cost analysis shows ${costIndex.toFixed(2)}x market baseline `;

        // Add cost assessment with financial context
        switch (category) {
            case 'very_affordable':
                reasoning += 'delivering exceptional value with significant cost savings';
                break;
            case 'affordable':
                reasoning += 'providing good value below market rates';
                break;
            case 'moderate':
                reasoning += 'reflecting standard market pricing with acceptable premiums';
                break;
            case 'expensive':
                reasoning += 'carrying premium pricing that requires cost justification';
                break;
        }

        // Add dimension breakdown for transparency
        reasoning += `. Breakdown: compute ${computeIndex}x, storage ${storageIndex}x, network ${networkIndex}x`;

        // Highlight significant cost drivers
        const maxDimension = Math.max(computeIndex, storageIndex, networkIndex);
        if (maxDimension > 1.5) {
            if (computeIndex === maxDimension) {
                reasoning += '. Compute costs are the primary cost driver';
            } else if (storageIndex === maxDimension) {
                reasoning += '. Storage costs significantly impact total expense';
            } else {
                reasoning += '. Network costs create notable pricing pressure';
            }
        }

        // Add confidence context
        if (confidence < 0.6) {
            reasoning += '. Cost assessment confidence reduced due to data inconsistencies';
        } else if (confidence > 0.9) {
            reasoning += '. High confidence in cost analysis';
        }

        // Add financial guidance for expensive regions
        if (category === 'expensive') {
            reasoning += '. The Referee questions whether performance benefits justify this cost premium';
        }

        return reasoning + '.';
    }

    /**
     * Get cost thresholds for external reference
     */
    getThresholds() {
        return {
            veryAffordable: this.VERY_AFFORDABLE_THRESHOLD,
            affordable: this.AFFORDABLE_THRESHOLD,
            moderate: this.MODERATE_THRESHOLD,
            extremeMultiplier: this.EXTREME_COST_MULTIPLIER
        };
    }

    /**
     * Get baseline costs for external reference
     */
    getBaselines() {
        return {
            compute: this.BASELINE_COMPUTE_COST,
            storage: this.BASELINE_STORAGE_COST,
            network: this.BASELINE_NETWORK_COST
        };
    }

    /**
     * Get dimension weights for external reference
     */
    getWeights() {
        return {
            compute: this.COMPUTE_WEIGHT,
            storage: this.STORAGE_WEIGHT,
            network: this.NETWORK_WEIGHT
        };
    }
}