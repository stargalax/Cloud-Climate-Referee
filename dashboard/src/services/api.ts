import { CloudRegion, ArbitratorVerdict, FactorWeights } from '@/types'

/**
 * API service layer that connects the dashboard to the RegionArbitrator backend
 * 
 * This service provides a clean interface for the dashboard to interact with
 * the RegionArbitrator system, handling initialization, configuration, and
 * evaluation requests.
 * 
 * Note: This is currently a mock implementation for dashboard development.
 * In production, this would connect to the actual RegionArbitrator backend.
 */
class RegionArbitratorAPI {
    private initialized: boolean = false
    private weights: FactorWeights

    constructor() {
        // Initialize with default referee logic weights
        this.weights = {
            carbon: 0.4,  // 40% weight for carbon (environmental priority)
            latency: 0.4, // 40% weight for latency (performance priority)
            cost: 0.2     // 20% weight for cost (budget consideration)
        }
        this.initialized = true
    }

    /**
     * Check if the API service is ready to handle requests
     */
    isReady(): boolean {
        return this.initialized
    }

    /**
     * Evaluate a single region and return the referee verdict
     * 
     * TODO: Replace with actual RegionArbitrator integration
     */
    async evaluateRegion(region: CloudRegion): Promise<ArbitratorVerdict> {
        if (!this.initialized) {
            throw new Error('RegionArbitratorAPI not initialized')
        }

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

            // Mock evaluation logic based on region characteristics
            const mockVerdict = this.generateMockVerdict(region)
            return mockVerdict
        } catch (error) {
            console.error('Failed to evaluate region:', region.regionCode, error)
            throw new Error(`Failed to evaluate region ${region.displayName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Evaluate multiple regions in parallel and return sorted verdicts
     * Results are sorted with the greenest region at the top
     */
    async evaluateMultipleRegions(regions: CloudRegion[]): Promise<ArbitratorVerdict[]> {
        if (!this.initialized) {
            throw new Error('RegionArbitratorAPI not initialized')
        }

        if (regions.length === 0) {
            return []
        }

        try {
            // Evaluate all regions in parallel
            const verdictPromises = regions.map(region => this.evaluateRegion(region))
            const verdicts = await Promise.all(verdictPromises)

            // Sort with greenest region first (highest carbon score)
            verdicts.sort((a, b) => {
                // Primary sort: Carbon score (descending - higher is better)
                const carbonDiff = b.scores.carbon.score - a.scores.carbon.score
                if (Math.abs(carbonDiff) > 1) {
                    return carbonDiff
                }

                // Secondary sort: Overall composite score
                const overallDiff = b.scores.composite.overallScore - a.scores.composite.overallScore
                if (Math.abs(overallDiff) > 1) {
                    return overallDiff
                }

                // Tertiary sort: Latency score for tie-breaking
                return b.scores.latency.score - a.scores.latency.score
            })

            return verdicts
        } catch (error) {
            console.error('Failed to evaluate multiple regions:', error)
            throw new Error(`Failed to evaluate regions: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Configure the factor weights for evaluation
     */
    configureWeights(weights: FactorWeights): void {
        if (!this.initialized) {
            throw new Error('RegionArbitratorAPI not initialized')
        }

        // Validate weights
        const sum = weights.carbon + weights.latency + weights.cost
        if (Math.abs(sum - 1.0) > 0.001) {
            throw new Error(`Factor weights must sum to 1.0, got ${sum.toFixed(3)}`)
        }

        this.weights = { ...weights }
    }

    /**
     * Get current factor weights configuration
     */
    getWeights(): FactorWeights {
        if (!this.initialized) {
            throw new Error('RegionArbitratorAPI not initialized')
        }

        return { ...this.weights }
    }

    /**
     * Get system configuration information
     */
    getConfiguration(): {
        weights: FactorWeights
        components: {
            dataCollector: string
            latencyAnalyzer: string
            carbonAnalyzer: string
            costAnalyzer: string
            scoringEngine: string
            verdictGenerator: string
        }
    } {
        if (!this.initialized) {
            throw new Error('RegionArbitratorAPI not initialized')
        }

        return {
            weights: this.getWeights(),
            components: {
                dataCollector: 'MockDataCollector',
                latencyAnalyzer: 'MockLatencyAnalyzer',
                carbonAnalyzer: 'MockCarbonAnalyzer',
                costAnalyzer: 'MockCostAnalyzer',
                scoringEngine: 'MockScoringEngine',
                verdictGenerator: 'MockVerdictGenerator'
            }
        }
    }

    /**
     * Format multiple region verdicts as a comprehensive Referee Match Report
     */
    formatMatchReport(verdicts: ArbitratorVerdict[], reportTitle?: string): string {
        if (verdicts.length === 0) {
            return '🏟️  REFEREE MATCH REPORT\n\nNo regions evaluated.\n'
        }

        const timestamp = new Date().toISOString()
        const title = reportTitle || 'Cloud Region Evaluation'

        let report = ''
        report += '🏟️  REFEREE MATCH REPORT\n'
        report += '═'.repeat(60) + '\n'
        report += `📋 Report: ${title}\n`
        report += `⏰ Generated: ${timestamp}\n`
        report += `🔧 Configuration: Carbon ${Math.round(this.weights.carbon * 100)}%, `
        report += `Latency ${Math.round(this.weights.latency * 100)}%, `
        report += `Cost ${Math.round(this.weights.cost * 100)}%\n`
        report += `📊 Regions Evaluated: ${verdicts.length}\n\n`

        // Summary section
        const playOnCount = verdicts.filter(v => v.verdict === 'Play On').length
        const yellowCardCount = verdicts.filter(v => v.verdict === 'Yellow Card').length
        const redCardCount = verdicts.filter(v => v.verdict === 'Red Card').length
        const blueCardCount = verdicts.filter(v => v.verdict === 'Blue Card').length

        report += '📈 MATCH SUMMARY\n'
        report += '─'.repeat(30) + '\n'
        report += `🟢 Play On: ${playOnCount} region${playOnCount !== 1 ? 's' : ''}\n`
        report += `🟡 Yellow Card: ${yellowCardCount} region${yellowCardCount !== 1 ? 's' : ''}\n`
        report += `🔴 Red Card: ${redCardCount} region${redCardCount !== 1 ? 's' : ''}\n`
        if (blueCardCount > 0) {
            report += `🔵 Blue Card: ${blueCardCount} region${blueCardCount !== 1 ? 's' : ''} (Technical Timeout)\n`
        }

        return report
    }

    /**
     * Health check method to verify the API is working correctly
     */
    async healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy'
        message: string
        timestamp: Date
        configuration: any
    }> {
        try {
            if (!this.initialized) {
                return {
                    status: 'unhealthy',
                    message: 'API not initialized',
                    timestamp: new Date(),
                    configuration: null
                }
            }

            const config = this.getConfiguration()

            return {
                status: 'healthy',
                message: 'RegionArbitratorAPI is ready and operational (Mock Mode)',
                timestamp: new Date(),
                configuration: config
            }
        } catch (error) {
            return {
                status: 'unhealthy',
                message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: new Date(),
                configuration: null
            }
        }
    }

    /**
     * Generate a mock verdict for development/testing purposes
     * TODO: Replace with actual RegionArbitrator integration
     */
    private generateMockVerdict(region: CloudRegion): ArbitratorVerdict {
        // Mock scoring based on region characteristics
        const isGreenRegion = ['eu-north-1', 'ca-central-1', 'us-west-2'].includes(region.regionCode)
        const isExpensiveRegion = ['ap-northeast-1', 'eu-west-1', 'us-east-1'].includes(region.regionCode)
        const isHighLatencyRegion = ['ap-southeast-2', 'sa-east-1', 'af-south-1'].includes(region.regionCode)

        // Generate scores with some randomness
        const baseCarbon = isGreenRegion ? 85 : 45
        const baseCost = isExpensiveRegion ? 35 : 75
        const baseLatency = isHighLatencyRegion ? 40 : 80

        const carbonScore = Math.max(0, Math.min(100, baseCarbon + (Math.random() * 20 - 10)))
        const costScore = Math.max(0, Math.min(100, baseCost + (Math.random() * 20 - 10)))
        const latencyScore = Math.max(0, Math.min(100, baseLatency + (Math.random() * 20 - 10)))

        // Apply weights to calculate composite score
        const compositeScore = (
            carbonScore * this.weights.carbon +
            latencyScore * this.weights.latency +
            costScore * this.weights.cost
        )

        // Apply Red Card Rule: Any individual score < 30 = Red Card
        const hasRedCardFactor = latencyScore < 30 || carbonScore < 30 || costScore < 30
        const finalScore = hasRedCardFactor ? Math.min(compositeScore, 29) : compositeScore

        // Determine verdict
        let verdict: 'Red Card' | 'Yellow Card' | 'Play On' | 'Blue Card'
        let reason: string

        if (finalScore < 40) {
            verdict = 'Red Card'
            reason = `The Referee cannot sanction this choice. ${region.displayName} scores poorly across multiple factors with current priorities.`
        } else if (finalScore < 70) {
            verdict = 'Yellow Card'
            reason = `The Referee advises caution for ${region.displayName}. While acceptable, there are trade-offs to consider.`
        } else {
            verdict = 'Play On'
            reason = `The Referee approves ${region.displayName}. This region meets performance and sustainability requirements.`
        }

        return {
            region,
            verdict,
            reason,
            suggestion: {
                type: verdict === 'Red Card' ? 'alternative_region' : 'optimization_strategy',
                description: verdict === 'Red Card'
                    ? 'Consider switching to a greener region like eu-north-1 (Stockholm) or ca-central-1 (Canada)'
                    : 'Consider optimizing your workload for better efficiency'
            },
            scores: {
                latency: {
                    score: latencyScore,
                    confidence: 0.8,
                    reasoning: `Mock latency analysis for ${region.displayName}`,
                    category: latencyScore > 70 ? 'good' : latencyScore > 40 ? 'acceptable' : 'poor'
                },
                carbon: {
                    score: carbonScore,
                    confidence: 0.7,
                    reasoning: `Mock carbon analysis for ${region.displayName}`,
                    category: carbonScore > 70 ? 'clean' : carbonScore > 40 ? 'moderate' : 'high_carbon',
                    renewablePercentage: isGreenRegion ? 85 + Math.random() * 10 : 20 + Math.random() * 40
                },
                cost: {
                    score: costScore,
                    confidence: 0.9,
                    reasoning: `Mock cost analysis for ${region.displayName}`,
                    category: costScore > 70 ? 'affordable' : costScore > 40 ? 'moderate' : 'expensive',
                    relativeCostIndex: isExpensiveRegion ? 1.2 + Math.random() * 0.3 : 0.8 + Math.random() * 0.4
                },
                composite: {
                    overallScore: finalScore,
                    weightedBreakdown: {
                        latency: latencyScore * this.weights.latency,
                        carbon: carbonScore * this.weights.carbon,
                        cost: costScore * this.weights.cost
                    },
                    confidence: 0.8
                }
            },
            timestamp: new Date(),
            refereeConfidence: finalScore > 70 ? 'High' : finalScore > 40 ? 'Medium' : 'Low'
        }
    }
}

// Create and export a singleton instance
export const regionArbitratorAPI = new RegionArbitratorAPI()

// Export the class for testing purposes
export { RegionArbitratorAPI }

// Export types for convenience
export type { CloudRegion, ArbitratorVerdict, FactorWeights }