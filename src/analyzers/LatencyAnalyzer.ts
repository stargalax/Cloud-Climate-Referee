import {
    LatencyAnalyzer,
    LatencyMetrics,
    LatencyScore,
    CloudRegion
} from '../types/index.js';

/**
 * Static Latency Map - Baseline inter-region latency data
 * Based on typical cloud provider network performance between regions
 */
interface StaticLatencyData {
    baselineLatency: number;    // Typical latency in ms
    p95Latency: number;         // Typical P95 latency in ms
    description: string;        // Geographic description
}

/**
 * Latency Analysis Module - Uses Static Baseline + Real Ping Confidence
 * 
 * The Referee uses a static latency map for consistent global judgment,
 * with real ping data used only to calculate confidence scores.
 * This ensures fair evaluation regardless of user location.
 */
export class RegionLatencyAnalyzer implements LatencyAnalyzer {
    private readonly EXCELLENT_THRESHOLD = 50;  // ms
    private readonly GOOD_THRESHOLD = 100;      // ms
    private readonly ACCEPTABLE_THRESHOLD = 150; // ms

    private readonly MAX_DATA_AGE_HOURS = 24;   // Hours before data is considered stale
    private readonly PING_VARIANCE_THRESHOLD = 0.5; // 50% variance threshold for confidence

    /**
     * Static Latency Map - Baseline data for major cloud regions
     * Based on typical inter-region performance and geographic factors
     */
    private readonly STATIC_LATENCY_MAP: Record<string, StaticLatencyData> = {
        // US East Coast
        'us-east-1': { baselineLatency: 25, p95Latency: 35, description: 'US East (Virginia)' },
        'us-east-2': { baselineLatency: 30, p95Latency: 42, description: 'US East (Ohio)' },

        // US West Coast  
        'us-west-1': { baselineLatency: 45, p95Latency: 65, description: 'US West (N. California)' },
        'us-west-2': { baselineLatency: 40, p95Latency: 58, description: 'US West (Oregon)' },

        // Europe
        'eu-west-1': { baselineLatency: 85, p95Latency: 120, description: 'Europe (Ireland)' },
        'eu-central-1': { baselineLatency: 90, p95Latency: 125, description: 'Europe (Frankfurt)' },
        'eu-west-2': { baselineLatency: 88, p95Latency: 122, description: 'Europe (London)' },

        // Asia Pacific
        'ap-southeast-1': { baselineLatency: 180, p95Latency: 250, description: 'Asia Pacific (Singapore)' },
        'ap-northeast-1': { baselineLatency: 160, p95Latency: 220, description: 'Asia Pacific (Tokyo)' },
        'ap-south-1': { baselineLatency: 200, p95Latency: 280, description: 'Asia Pacific (Mumbai)' },

        // Other regions
        'ca-central-1': { baselineLatency: 35, p95Latency: 50, description: 'Canada (Central)' },
        'sa-east-1': { baselineLatency: 150, p95Latency: 210, description: 'South America (São Paulo)' },
        'af-south-1': { baselineLatency: 220, p95Latency: 310, description: 'Africa (Cape Town)' },
        'me-south-1': { baselineLatency: 140, p95Latency: 195, description: 'Middle East (Bahrain)' },

        // Azure regions
        'eastus': { baselineLatency: 25, p95Latency: 35, description: 'Azure East US' },
        'westus2': { baselineLatency: 40, p95Latency: 58, description: 'Azure West US 2' },
        'westeurope': { baselineLatency: 85, p95Latency: 120, description: 'Azure West Europe' },

        // GCP regions
        'us-central1': { baselineLatency: 32, p95Latency: 45, description: 'GCP US Central' },
        'europe-west1': { baselineLatency: 85, p95Latency: 120, description: 'GCP Europe West' },
        'asia-southeast1': { baselineLatency: 180, p95Latency: 250, description: 'GCP Asia Southeast' }
    };

    /**
     * Analyze latency using Static Baseline + Real Ping Confidence
     */
    analyzeLatency(metrics: LatencyMetrics): LatencyScore {
        // Get baseline latency from static map (this is what we score)
        const baselineData = this.getBaselineLatency(metrics);
        const baselineLatency = baselineData.baselineLatency;

        // Calculate score using baseline latency (not real ping)
        const baseScore = this.normalizeLatencyScore(baselineLatency);

        // Calculate confidence using real ping vs baseline comparison
        const confidence = this.calculateConfidenceWithPingValidation(metrics, baselineData);

        // Determine performance category based on baseline
        const category = this.categorizeLatency(baselineLatency);

        // Generate reasoning explanation
        const reasoning = this.generateReasoning(metrics, baselineData, baseScore, category, confidence);

        return {
            score: Math.round(baseScore * 100) / 100,
            confidence,
            reasoning,
            category
        };
    }

    /**
     * Get baseline latency data for a region from static map
     */
    private getBaselineLatency(metrics: LatencyMetrics): StaticLatencyData {
        // Try to extract region code from source location or use fallback
        const regionCode = this.extractRegionCode(metrics);

        const baseline = this.STATIC_LATENCY_MAP[regionCode];
        if (baseline) {
            return baseline;
        }

        // Fallback: estimate based on geographic distance if available
        return this.estimateBaselineFromGeography(metrics);
    }

    /**
     * Extract region code from metrics or source location
     */
    private extractRegionCode(metrics: LatencyMetrics): string {
        // If source location contains a region code pattern, extract it
        const regionPatterns = Object.keys(this.STATIC_LATENCY_MAP);
        for (const pattern of regionPatterns) {
            if (metrics.sourceLocation.includes(pattern)) {
                return pattern;
            }
        }

        // Check if it's an unknown region pattern
        if (metrics.sourceLocation.includes('unknown')) {
            return 'unknown-region';
        }

        // Default fallback
        return 'us-east-1';
    }

    /**
     * Estimate baseline latency from geographic factors when region is unknown
     */
    private estimateBaselineFromGeography(metrics: LatencyMetrics): StaticLatencyData {
        // Conservative estimate for unknown regions
        return {
            baselineLatency: 100,
            p95Latency: 140,
            description: 'Unknown region (estimated)'
        };
    }

    /**
     * Calculate confidence by comparing real ping to baseline expectations
     */
    private calculateConfidenceWithPingValidation(
        metrics: LatencyMetrics,
        baseline: StaticLatencyData
    ): number {
        let confidence = 1.0;

        // Factor 1: Data freshness
        const dataAgeHours = this.getDataAgeHours(metrics.measurementTimestamp);
        if (dataAgeHours > this.MAX_DATA_AGE_HOURS) {
            const staleFactor = Math.min(dataAgeHours / (this.MAX_DATA_AGE_HOURS * 2), 0.5);
            confidence -= staleFactor;
        }

        // Factor 2: Real ping vs baseline variance (KEY FACTOR)
        const realPing = metrics.averageLatency;
        const expectedPing = baseline.baselineLatency;
        const variance = Math.abs(realPing - expectedPing) / expectedPing;

        if (variance > this.PING_VARIANCE_THRESHOLD) {
            // Real ping is significantly different from baseline - reduce confidence
            const variancePenalty = Math.min(variance * 0.6, 0.7);
            confidence -= variancePenalty;
        }

        // Factor 3: P95 consistency check
        const p95Variance = metrics.p95Latency / metrics.averageLatency;
        if (p95Variance > 2.5) {
            confidence -= Math.min((p95Variance - 2.5) * 0.15, 0.25);
        }

        // Factor 4: Mock data detection
        if (metrics.sourceLocation.includes('mock')) {
            confidence *= 0.4; // Heavy penalty for mock data
        }

        // Factor 5: Suspicious latency values
        if (realPing < 1 || realPing > 1000) {
            confidence *= 0.3;
        }

        return Math.max(0.1, Math.min(1.0, confidence));
    }

    /**
     * Normalize latency score using Referee logic (0ms = 100, 200ms = 0)
     */
    private normalizeLatencyScore(latencyMs: number): number {
        const MAX_LATENCY = 200; // ms

        if (latencyMs <= 0) return 100;
        if (latencyMs >= MAX_LATENCY) return 0;

        const score = 100 - (latencyMs / MAX_LATENCY) * 100;
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Categorize latency performance for clear communication
     */
    private categorizeLatency(latencyMs: number): 'excellent' | 'good' | 'acceptable' | 'poor' {
        if (latencyMs <= this.EXCELLENT_THRESHOLD) return 'excellent';
        if (latencyMs <= this.GOOD_THRESHOLD) return 'good';
        if (latencyMs <= this.ACCEPTABLE_THRESHOLD) return 'acceptable';
        return 'poor';
    }

    /**
     * Generate human-readable reasoning with baseline context
     */
    private generateReasoning(
        metrics: LatencyMetrics,
        baseline: StaticLatencyData,
        score: number,
        category: string,
        confidence: number
    ): string {
        const baselineLatency = Math.round(baseline.baselineLatency);
        const realPing = Math.round(metrics.averageLatency);
        const variance = Math.abs(realPing - baseline.baselineLatency) / baseline.baselineLatency;

        let reasoning = `${baseline.description} baseline latency of ${baselineLatency}ms `;

        // Add performance assessment
        switch (category) {
            case 'excellent':
                reasoning += 'delivers exceptional global performance';
                break;
            case 'good':
                reasoning += 'provides good global performance';
                break;
            case 'acceptable':
                reasoning += 'meets acceptable global standards';
                break;
            case 'poor':
                reasoning += 'shows concerning global performance';
                break;
        }

        // Add real ping validation context
        if (variance > this.PING_VARIANCE_THRESHOLD) {
            const direction = realPing > baseline.baselineLatency ? 'higher' : 'lower';
            reasoning += `. Real measurement of ${realPing}ms is ${direction} than expected, reducing confidence`;
        } else if (variance < 0.2) {
            reasoning += `. Real measurement of ${realPing}ms confirms baseline expectations`;
        }

        // Add confidence context
        if (confidence < 0.6) {
            reasoning += '. Low confidence due to measurement inconsistencies';
        } else if (confidence > 0.9) {
            reasoning += '. High confidence in assessment';
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
     * Get all available regions from the static latency map
     */
    getAvailableRegions(): string[] {
        return Object.keys(this.STATIC_LATENCY_MAP);
    }

    /**
     * Get baseline data for a specific region
     */
    getRegionBaseline(regionCode: string): StaticLatencyData | null {
        return this.STATIC_LATENCY_MAP[regionCode] || null;
    }
}