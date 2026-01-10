import {
    CarbonAnalyzer,
    CarbonMetrics,
    CarbonScore
} from '../types/index';

/**
 * Carbon Intensity Analysis Module
 * 
 * The Referee evaluates regions based on their environmental impact,
 * considering both carbon intensity (gCO2/kWh) and renewable energy percentage.
 * Uses authoritative data sources to make ethical environmental judgments.
 */
export class RegionCarbonAnalyzer implements CarbonAnalyzer {
    private readonly MAX_CARBON_INTENSITY = 500; // gCO2/kWh - worst case threshold
    private readonly MIN_CARBON_INTENSITY = 0;   // gCO2/kWh - best case (theoretical)

    private readonly VERY_CLEAN_THRESHOLD = 100;  // gCO2/kWh
    private readonly CLEAN_THRESHOLD = 200;       // gCO2/kWh  
    private readonly MODERATE_THRESHOLD = 350;    // gCO2/kWh

    private readonly HIGH_RENEWABLE_THRESHOLD = 80; // % renewable
    private readonly GOOD_RENEWABLE_THRESHOLD = 50; // % renewable
    private readonly LOW_RENEWABLE_THRESHOLD = 20;  // % renewable

    private readonly MAX_DATA_AGE_HOURS = 6;      // Hours before carbon data is considered stale
    private readonly TRUSTED_DATA_SOURCES = [
        'electricitymaps',
        'eia.gov',
        'iea.org',
        'ember-climate.org'
    ];

    /**
     * Analyze carbon impact incorporating both intensity and renewable percentage
     */
    analyzeCarbonImpact(metrics: CarbonMetrics): CarbonScore {
        // Validate input data
        this.validateCarbonMetrics(metrics);

        // Calculate base score from carbon intensity using Referee normalization
        const intensityScore = this.normalizeCarbonScore(metrics.carbonIntensity);

        // Apply renewable energy bonus/penalty
        const renewableAdjustment = this.calculateRenewableAdjustment(metrics.renewablePercentage);
        const adjustedScore = Math.min(100, intensityScore + renewableAdjustment);

        // Calculate confidence based on data quality and freshness
        const confidence = this.calculateConfidence(metrics);

        // Determine environmental category
        const category = this.categorizeCarbon(metrics.carbonIntensity, metrics.renewablePercentage);

        // Generate reasoning with ethical context
        const reasoning = this.generateReasoning(metrics, adjustedScore, category, confidence);

        return {
            score: Math.round(adjustedScore * 100) / 100,
            confidence,
            reasoning,
            category,
            renewablePercentage: metrics.renewablePercentage
        };
    }

    /**
     * Validate carbon metrics for completeness and sanity
     */
    private validateCarbonMetrics(metrics: CarbonMetrics): void {
        if (metrics.carbonIntensity < 0 || metrics.carbonIntensity > 1000) {
            throw new Error(`Invalid carbon intensity: ${metrics.carbonIntensity} gCO2/kWh`);
        }

        if (metrics.renewablePercentage < 0 || metrics.renewablePercentage > 100) {
            throw new Error(`Invalid renewable percentage: ${metrics.renewablePercentage}%`);
        }

        if (!metrics.dataSource || metrics.dataSource.trim().length === 0) {
            throw new Error('Carbon data source must be specified');
        }

        if (!metrics.lastUpdated) {
            throw new Error('Carbon data timestamp must be provided');
        }
    }

    /**
     * Normalize carbon intensity score using Referee logic (0g = 100, 500g = 0)
     */
    private normalizeCarbonScore(carbonIntensity: number): number {
        if (carbonIntensity <= this.MIN_CARBON_INTENSITY) return 100;
        if (carbonIntensity >= this.MAX_CARBON_INTENSITY) return 0;

        const score = 100 - (carbonIntensity / this.MAX_CARBON_INTENSITY) * 100;
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate renewable energy adjustment to the base carbon score
     */
    private calculateRenewableAdjustment(renewablePercentage: number): number {
        // High renewable percentage can boost score up to +15 points
        // Low renewable percentage can penalize score up to -10 points

        if (renewablePercentage >= this.HIGH_RENEWABLE_THRESHOLD) {
            // Excellent renewable mix - significant bonus
            const bonus = 10 + ((renewablePercentage - this.HIGH_RENEWABLE_THRESHOLD) / 20) * 5;
            return Math.min(15, bonus);
        } else if (renewablePercentage >= this.GOOD_RENEWABLE_THRESHOLD) {
            // Good renewable mix - moderate bonus
            const bonus = ((renewablePercentage - this.GOOD_RENEWABLE_THRESHOLD) / 30) * 10;
            return Math.min(10, bonus);
        } else if (renewablePercentage >= this.LOW_RENEWABLE_THRESHOLD) {
            // Low renewable mix - neutral to slight penalty
            const penalty = ((this.LOW_RENEWABLE_THRESHOLD - renewablePercentage) / 20) * 5;
            return -Math.min(5, penalty);
        } else {
            // Very low renewable mix - significant penalty
            const penalty = 5 + ((this.LOW_RENEWABLE_THRESHOLD - renewablePercentage) / 20) * 5;
            return -Math.min(10, penalty);
        }
    }

    /**
     * Calculate confidence based on data source quality and freshness
     */
    private calculateConfidence(metrics: CarbonMetrics): number {
        let confidence = 1.0;

        // Factor 1: Data source trustworthiness
        const isTrustedSource = this.TRUSTED_DATA_SOURCES.some(source =>
            metrics.dataSource.toLowerCase().includes(source)
        );

        if (!isTrustedSource) {
            confidence -= 0.3; // Significant penalty for untrusted sources
        }

        // Factor 2: Data freshness (carbon data changes frequently)
        const dataAgeHours = this.getDataAgeHours(metrics.lastUpdated);
        if (dataAgeHours > this.MAX_DATA_AGE_HOURS) {
            const staleFactor = Math.min(dataAgeHours / (this.MAX_DATA_AGE_HOURS * 4), 0.4);
            confidence -= staleFactor;
        }

        // Factor 3: Data consistency checks
        if (metrics.carbonIntensity === 0 && metrics.renewablePercentage < 95) {
            // Suspicious: zero carbon but not nearly 100% renewable
            confidence -= 0.4;
        }

        if (metrics.carbonIntensity > 600 && metrics.renewablePercentage > 50) {
            // Suspicious: very high carbon but high renewables
            confidence -= 0.3;
        }

        // Factor 4: Mock or test data detection
        if (metrics.dataSource.toLowerCase().includes('mock') ||
            metrics.dataSource.toLowerCase().includes('test')) {
            confidence *= 0.3; // Heavy penalty for mock data
        }

        return Math.max(0.1, Math.min(1.0, confidence));
    }

    /**
     * Categorize carbon performance for clear environmental communication
     */
    private categorizeCarbon(
        carbonIntensity: number,
        renewablePercentage: number
    ): 'very_clean' | 'clean' | 'moderate' | 'high_carbon' {
        // Primary classification by carbon intensity
        if (carbonIntensity <= this.VERY_CLEAN_THRESHOLD) {
            return renewablePercentage >= this.HIGH_RENEWABLE_THRESHOLD ? 'very_clean' : 'clean';
        } else if (carbonIntensity <= this.CLEAN_THRESHOLD) {
            return renewablePercentage >= this.GOOD_RENEWABLE_THRESHOLD ? 'clean' : 'moderate';
        } else if (carbonIntensity <= this.MODERATE_THRESHOLD) {
            return renewablePercentage >= this.LOW_RENEWABLE_THRESHOLD ? 'moderate' : 'high_carbon';
        } else {
            return 'high_carbon';
        }
    }

    /**
     * Generate reasoning with ethical environmental context
     */
    private generateReasoning(
        metrics: CarbonMetrics,
        score: number,
        category: string,
        confidence: number
    ): string {
        const intensity = Math.round(metrics.carbonIntensity);
        const renewable = Math.round(metrics.renewablePercentage);

        let reasoning = `Carbon intensity of ${intensity}g CO2/kWh with ${renewable}% renewable energy `;

        // Add environmental assessment with ethical framing
        switch (category) {
            case 'very_clean':
                reasoning += 'represents exemplary environmental stewardship';
                break;
            case 'clean':
                reasoning += 'demonstrates good environmental responsibility';
                break;
            case 'moderate':
                reasoning += 'shows mixed environmental impact requiring consideration';
                break;
            case 'high_carbon':
                reasoning += 'carries significant environmental cost that demands justification';
                break;
        }

        // Add renewable energy context
        if (renewable >= this.HIGH_RENEWABLE_THRESHOLD) {
            reasoning += '. Excellent renewable energy mix supports sustainable operations';
        } else if (renewable >= this.GOOD_RENEWABLE_THRESHOLD) {
            reasoning += '. Good renewable energy adoption helps offset carbon impact';
        } else if (renewable >= this.LOW_RENEWABLE_THRESHOLD) {
            reasoning += '. Limited renewable energy increases environmental concern';
        } else {
            reasoning += '. Very low renewable energy significantly amplifies carbon footprint';
        }

        // Add data quality context
        if (confidence < 0.6) {
            reasoning += '. Assessment confidence reduced due to data quality concerns';
        } else if (confidence > 0.9) {
            reasoning += '. High confidence in environmental assessment';
        }

        // Add ethical context for high-carbon regions
        if (category === 'high_carbon') {
            reasoning += '. The Referee questions whether performance gains justify this environmental cost';
        }

        return reasoning + '.';
    }

    /**
     * Calculate data age in hours
     */
    private getDataAgeHours(timestamp: Date): number {
        const now = new Date();
        const ageMs = now.getTime() - timestamp.getTime();
        return ageMs / (1000 * 60 * 60);
    }

    /**
     * Get carbon intensity thresholds for external reference
     */
    getThresholds() {
        return {
            veryClean: this.VERY_CLEAN_THRESHOLD,
            clean: this.CLEAN_THRESHOLD,
            moderate: this.MODERATE_THRESHOLD,
            maxIntensity: this.MAX_CARBON_INTENSITY
        };
    }

    /**
     * Get renewable energy thresholds for external reference
     */
    getRenewableThresholds() {
        return {
            high: this.HIGH_RENEWABLE_THRESHOLD,
            good: this.GOOD_RENEWABLE_THRESHOLD,
            low: this.LOW_RENEWABLE_THRESHOLD
        };
    }
}