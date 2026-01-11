import {
    RegionArbitrator,
    CloudRegion,
    ArbitratorVerdict,
    FactorWeights,
    DataCollector,
    LatencyAnalyzer,
    CarbonAnalyzer,
    CostAnalyzer,
    ScoringEngine,
    VerdictGenerator,
    DataCollectionError
} from './types/index';

import { RegionDataCollector } from './data/DataCollector';
import { RegionLatencyAnalyzer } from './analyzers/LatencyAnalyzer';
import { RegionCarbonAnalyzer } from './analyzers/CarbonAnalyzer';
import { RegionCostAnalyzer } from './analyzers/CostAnalyzer';
import { RegionScoringEngine } from './scoring/ScoringEngine';
import { RegionVerdictGenerator } from './scoring/VerdictGenerator';

/**
 * Main RegionArbitrator class that orchestrates all components
 * 
 * This class provides the primary interface for evaluating cloud regions
 * based on latency, carbon intensity, and cost factors. It coordinates
 * data collection, analysis, scoring, and verdict generation.
 */
export class CloudRegionArbitrator implements RegionArbitrator {
    private dataCollector: DataCollector;
    private latencyAnalyzer: LatencyAnalyzer;
    private carbonAnalyzer: CarbonAnalyzer;
    private costAnalyzer: CostAnalyzer;
    private scoringEngine: ScoringEngine;
    private verdictGenerator: VerdictGenerator;

    private factorWeights: FactorWeights;

    /**
     * Initialize the RegionArbitrator with all required components
     */
    constructor(
        dataCollector?: DataCollector,
        latencyAnalyzer?: LatencyAnalyzer,
        carbonAnalyzer?: CarbonAnalyzer,
        costAnalyzer?: CostAnalyzer,
        scoringEngine?: ScoringEngine,
        verdictGenerator?: VerdictGenerator,
        initialWeights?: FactorWeights
    ) {
        // Use provided components or create default instances
        this.dataCollector = dataCollector || new RegionDataCollector();
        this.latencyAnalyzer = latencyAnalyzer || new RegionLatencyAnalyzer();
        this.carbonAnalyzer = carbonAnalyzer || new RegionCarbonAnalyzer();
        this.costAnalyzer = costAnalyzer || new RegionCostAnalyzer();
        this.scoringEngine = scoringEngine || new RegionScoringEngine();
        this.verdictGenerator = verdictGenerator || new RegionVerdictGenerator();

        // Set default weights following Referee logic: Carbon 40%, Latency 40%, Cost 20%
        this.factorWeights = initialWeights || {
            carbon: 0.4,
            latency: 0.4,
            cost: 0.2
        };

        // Validate initial weights
        this.validateWeights(this.factorWeights);
    }

    /**
     * Evaluate a single cloud region and return a referee verdict
     */
    async evaluateRegion(region: CloudRegion): Promise<ArbitratorVerdict> {
        try {
            // Step 1: Collect data for all factors
            const [latencyMetrics, carbonMetrics, costMetrics] = await Promise.all([
                this.dataCollector.getLatencyData(region),
                this.dataCollector.getCarbonData(region),
                this.dataCollector.getCostData(region)
            ]);

            // Step 2: Analyze each factor independently
            const latencyScore = this.latencyAnalyzer.analyzeLatency(latencyMetrics);
            const carbonScore = this.carbonAnalyzer.analyzeCarbonImpact(carbonMetrics);
            const costScore = this.costAnalyzer.analyzeCost(costMetrics);

            // Step 3: Combine scores using configured weights
            const compositeScore = this.scoringEngine.combineScores(
                latencyScore,
                carbonScore,
                costScore,
                this.factorWeights
            );

            // Step 4: Generate verdict with reasoning and suggestions
            const verdict = this.verdictGenerator.generateVerdict(
                compositeScore,
                region,
                { latency: latencyScore, carbon: carbonScore, cost: costScore }
            );

            return verdict;

        } catch (error) {
            // Check if this is a DataCollectionError that should trigger Blue Card
            if (error instanceof DataCollectionError) {
                return this.verdictGenerator.generateVerdict(
                    {
                        overallScore: 0,
                        weightedBreakdown: { latency: 0, carbon: 0, cost: 0 },
                        confidence: 0
                    },
                    region,
                    undefined,
                    undefined,
                    undefined,
                    error
                );
            }

            // Handle other errors gracefully with a fallback verdict
            return this.createErrorVerdict(region, error);
        }
    }

    /**
     * Evaluate multiple cloud regions and return verdicts for each
     * Results are sorted with the greenest region at the top
     */
    async evaluateMultipleRegions(regions: CloudRegion[]): Promise<ArbitratorVerdict[]> {
        if (regions.length === 0) {
            return [];
        }

        try {
            // Collect all region scores for green alternative suggestions
            const regionScores = new Map<string, {
                carbon: any;
                latency: any;
                cost: any;
            }>();

            // Step 1: Evaluate each region independently using parallel data collection
            const evaluationPromises = regions.map(async (region) => {
                try {
                    // Collect data for all factors in parallel
                    const [latencyMetrics, carbonMetrics, costMetrics] = await Promise.all([
                        this.dataCollector.getLatencyData(region),
                        this.dataCollector.getCarbonData(region),
                        this.dataCollector.getCostData(region)
                    ]);

                    // Analyze each factor
                    const latencyScore = this.latencyAnalyzer.analyzeLatency(latencyMetrics);
                    const carbonScore = this.carbonAnalyzer.analyzeCarbonImpact(carbonMetrics);
                    const costScore = this.costAnalyzer.analyzeCost(costMetrics);

                    // Store scores for green alternative analysis
                    regionScores.set(region.regionCode, {
                        carbon: carbonScore,
                        latency: latencyScore,
                        cost: costScore
                    });

                    // Combine scores
                    const compositeScore = this.scoringEngine.combineScores(
                        latencyScore,
                        carbonScore,
                        costScore,
                        this.factorWeights
                    );

                    return {
                        region,
                        compositeScore,
                        individualScores: { latency: latencyScore, carbon: carbonScore, cost: costScore }
                    };

                } catch (error) {
                    // Store error for later processing
                    return {
                        region,
                        compositeScore: null,
                        individualScores: null,
                        error
                    };
                }
            });

            // Wait for all evaluations to complete
            const evaluationResults = await Promise.all(evaluationPromises);

            // Step 2: Generate verdicts with cross-region green suggestions
            const verdicts = evaluationResults.map((result) => {
                if (result.error) {
                    // Check if this is a DataCollectionError that should trigger Blue Card
                    if (result.error instanceof DataCollectionError) {
                        return this.verdictGenerator.generateVerdict(
                            {
                                overallScore: 0,
                                weightedBreakdown: { latency: 0, carbon: 0, cost: 0 },
                                confidence: 0
                            },
                            result.region,
                            undefined,
                            regions,
                            regionScores,
                            result.error
                        );
                    }
                    return this.createErrorVerdict(result.region, result.error);
                }

                if (!result.compositeScore || !result.individualScores) {
                    return this.createErrorVerdict(result.region, new Error('Missing evaluation data'));
                }

                return this.verdictGenerator.generateVerdict(
                    result.compositeScore,
                    result.region,
                    result.individualScores,
                    regions, // Pass all regions for green alternatives
                    regionScores // Pass all region scores for comparison
                );
            });

            // Step 3: Sort results with greenest region at the top
            // Primary sort: Carbon score (descending - higher is better)
            // Secondary sort: Overall score (descending)
            // Tertiary sort: Latency score (descending) for tie-breaking
            verdicts.sort((a, b) => {
                // First priority: Carbon score (greenest first)
                const carbonDiff = b.scores.carbon.score - a.scores.carbon.score;
                if (Math.abs(carbonDiff) > 1) { // Allow for small floating point differences
                    return carbonDiff;
                }

                // Second priority: Overall composite score
                const overallDiff = b.scores.composite.overallScore - a.scores.composite.overallScore;
                if (Math.abs(overallDiff) > 1) {
                    return overallDiff;
                }

                // Third priority: Latency score for tie-breaking
                return b.scores.latency.score - a.scores.latency.score;
            });

            return verdicts;

        } catch (error) {
            // If the entire batch fails, return error verdicts for all regions
            return regions.map(region => this.createErrorVerdict(region, error));
        }
    }

    /**
     * Configure factor weights with validation
     */
    configureWeights(weights: FactorWeights): void {
        this.validateWeights(weights);
        this.factorWeights = { ...weights };
    }

    /**
     * Get current factor weights
     */
    getWeights(): FactorWeights {
        return { ...this.factorWeights };
    }

    /**
     * Validate that factor weights are valid and sum to 1.0
     */
    private validateWeights(weights: FactorWeights): void {
        // Check that all weights are non-negative
        if (weights.carbon < 0 || weights.latency < 0 || weights.cost < 0) {
            throw new Error('All factor weights must be non-negative');
        }

        // Check that weights sum to approximately 1.0 (allow small floating point errors)
        const sum = weights.carbon + weights.latency + weights.cost;
        if (Math.abs(sum - 1.0) > 0.001) {
            throw new Error(`Factor weights must sum to 1.0, got ${sum.toFixed(3)}`);
        }

        // Check that no single weight dominates completely (> 0.8)
        if (weights.carbon > 0.8 || weights.latency > 0.8 || weights.cost > 0.8) {
            throw new Error('No single factor weight should exceed 0.8 to maintain balanced evaluation');
        }
    }

    /**
     * Create an error verdict when evaluation fails
     */
    private createErrorVerdict(region: CloudRegion, error: any): ArbitratorVerdict {
        const errorMessage = error instanceof Error ? error.message : 'Unknown evaluation error';

        return {
            region,
            verdict: 'Red Card',
            reason: `The Referee cannot evaluate this region due to a technical issue: ${errorMessage}. ` +
                `This region receives an automatic Red Card until the issue is resolved.`,
            suggestion: {
                type: 'optimization_strategy',
                description: 'The Referee recommends resolving the technical evaluation issue before proceeding. ' +
                    'Check data connectivity, API credentials, and region configuration.',
                expectedImpact: 'Restored evaluation capability for informed decision making'
            },
            scores: {
                latency: {
                    score: 0,
                    confidence: 0,
                    reasoning: 'Evaluation failed - no latency data available',
                    category: 'poor'
                },
                carbon: {
                    score: 0,
                    confidence: 0,
                    reasoning: 'Evaluation failed - no carbon data available',
                    category: 'high_carbon',
                    renewablePercentage: 0
                },
                cost: {
                    score: 0,
                    confidence: 0,
                    reasoning: 'Evaluation failed - no cost data available',
                    category: 'expensive',
                    relativeCostIndex: 0
                },
                composite: {
                    overallScore: 0,
                    weightedBreakdown: {
                        latency: 0,
                        carbon: 0,
                        cost: 0
                    },
                    confidence: 0
                }
            },
            timestamp: new Date(),
            refereeConfidence: 'Low'
        };
    }

    /**
     * Get information about the current configuration
     */
    getConfiguration(): {
        weights: FactorWeights;
        components: {
            dataCollector: string;
            latencyAnalyzer: string;
            carbonAnalyzer: string;
            costAnalyzer: string;
            scoringEngine: string;
            verdictGenerator: string;
        };
    } {
        return {
            weights: this.getWeights(),
            components: {
                dataCollector: this.dataCollector.constructor.name,
                latencyAnalyzer: this.latencyAnalyzer.constructor.name,
                carbonAnalyzer: this.carbonAnalyzer.constructor.name,
                costAnalyzer: this.costAnalyzer.constructor.name,
                scoringEngine: this.scoringEngine.constructor.name,
                verdictGenerator: this.verdictGenerator.constructor.name
            }
        };
    }

    /**
     * Format multiple region verdicts as a Referee Match Report
     * Provides a comprehensive, formatted report suitable for decision-making
     */
    formatMatchReport(verdicts: ArbitratorVerdict[], reportTitle?: string): string {
        if (verdicts.length === 0) {
            return '🏟️  REFEREE MATCH REPORT\n\nNo regions evaluated.\n';
        }

        const timestamp = new Date().toISOString();
        const title = reportTitle || 'Cloud Region Evaluation';

        let report = '';
        report += '🏟️  REFEREE MATCH REPORT\n';
        report += '═'.repeat(60) + '\n';
        report += `📋 Report: ${title}\n`;
        report += `⏰ Generated: ${timestamp}\n`;
        report += `🔧 Configuration: Carbon ${Math.round(this.factorWeights.carbon * 100)}%, `;
        report += `Latency ${Math.round(this.factorWeights.latency * 100)}%, `;
        report += `Cost ${Math.round(this.factorWeights.cost * 100)}%\n`;
        report += `📊 Regions Evaluated: ${verdicts.length}\n\n`;

        // Summary section
        const playOnCount = verdicts.filter(v => v.verdict === 'Play On').length;
        const yellowCardCount = verdicts.filter(v => v.verdict === 'Yellow Card').length;
        const redCardCount = verdicts.filter(v => v.verdict === 'Red Card').length;
        const blueCardCount = verdicts.filter(v => v.verdict === 'Blue Card').length;

        report += '📈 MATCH SUMMARY\n';
        report += '─'.repeat(30) + '\n';
        report += `🟢 Play On: ${playOnCount} region${playOnCount !== 1 ? 's' : ''}\n`;
        report += `🟡 Yellow Card: ${yellowCardCount} region${yellowCardCount !== 1 ? 's' : ''}\n`;
        report += `🔴 Red Card: ${redCardCount} region${redCardCount !== 1 ? 's' : ''}\n`;
        if (blueCardCount > 0) {
            report += `🔵 Blue Card: ${blueCardCount} region${blueCardCount !== 1 ? 's' : ''} (Technical Timeout)\n`;
        }
        report += '\n';

        // Greenest region highlight
        const greenestRegion = verdicts[0]; // Already sorted with greenest first
        report += '🌱 GREENEST CHOICE\n';
        report += '─'.repeat(30) + '\n';
        report += `🏆 Winner: ${greenestRegion.region.displayName}\n`;
        report += `🎯 Verdict: ${greenestRegion.verdict}\n`;
        report += `🌿 Carbon Score: ${Math.round(greenestRegion.scores.carbon.score)}/100 `;
        report += `(${greenestRegion.scores.carbon.category}, ${Math.round(greenestRegion.scores.carbon.renewablePercentage)}% renewable)\n`;
        report += `⚡ Latency Score: ${Math.round(greenestRegion.scores.latency.score)}/100 `;
        report += `(${greenestRegion.scores.latency.category})\n`;
        report += `💰 Cost Score: ${Math.round(greenestRegion.scores.cost.score)}/100 `;
        report += `(${greenestRegion.scores.cost.category})\n`;
        report += `📊 Overall Score: ${Math.round(greenestRegion.scores.composite.overallScore)}/100\n`;
        report += `🎯 Referee Confidence: ${greenestRegion.refereeConfidence || 'Medium'}\n\n`;

        // Detailed region analysis
        report += '📋 DETAILED ANALYSIS\n';
        report += '─'.repeat(30) + '\n';

        verdicts.forEach((verdict, index) => {
            const rank = index + 1;
            const verdictEmoji = this.getVerdictEmoji(verdict.verdict);

            report += `${rank}. ${verdictEmoji} ${verdict.region.displayName} (${verdict.region.regionCode})\n`;
            report += `   🎯 Verdict: ${verdict.verdict} (${Math.round(verdict.scores.composite.overallScore)}/100)\n`;

            // Factor breakdown
            report += `   📊 Factors: `;
            report += `Carbon ${Math.round(verdict.scores.carbon.score)}/100, `;
            report += `Latency ${Math.round(verdict.scores.latency.score)}/100, `;
            report += `Cost ${Math.round(verdict.scores.cost.score)}/100\n`;

            // Weighted contribution
            report += `   ⚖️  Weighted: `;
            report += `Carbon ${Math.round(verdict.scores.composite.weightedBreakdown.carbon)}pts, `;
            report += `Latency ${Math.round(verdict.scores.composite.weightedBreakdown.latency)}pts, `;
            report += `Cost ${Math.round(verdict.scores.composite.weightedBreakdown.cost)}pts\n`;

            // Confidence and location
            report += `   🎯 Confidence: ${verdict.refereeConfidence || 'Medium'}\n`;
            report += `   📍 Location: ${verdict.region.location.country}`;
            if (verdict.region.location.city) {
                report += ` (${verdict.region.location.city})`;
            }
            report += '\n';

            // Reasoning (truncated for report)
            const shortReason = verdict.reason.length > 120
                ? verdict.reason.substring(0, 120) + '...'
                : verdict.reason;
            report += `   💭 Reasoning: ${shortReason}\n`;

            // Green suggestion type
            report += `   🌱 Green Path: ${verdict.suggestion.type.replace('_', ' ')}\n`;

            report += '\n';
        });

        // Recommendations section
        report += '🎯 REFEREE RECOMMENDATIONS\n';
        report += '─'.repeat(30) + '\n';

        if (playOnCount > 0) {
            report += `✅ The Referee approves ${playOnCount} region${playOnCount !== 1 ? 's' : ''} for immediate deployment.\n`;
        }

        if (yellowCardCount > 0) {
            report += `⚠️  ${yellowCardCount} region${yellowCardCount !== 1 ? 's' : ''} require${yellowCardCount === 1 ? 's' : ''} careful consideration of trade-offs.\n`;
        }

        if (redCardCount > 0) {
            report += `🚫 ${redCardCount} region${redCardCount !== 1 ? 's' : ''} should be avoided due to significant concerns.\n`;
        }

        if (blueCardCount > 0) {
            report += `⏸️  ${blueCardCount} region${blueCardCount !== 1 ? 's' : ''} cannot be evaluated due to data issues.\n`;
        }

        // Final recommendation
        report += '\n🏆 FINAL VERDICT\n';
        report += '─'.repeat(30) + '\n';
        report += `The Referee recommends ${greenestRegion.region.displayName} as the optimal choice, `;
        report += `balancing environmental responsibility with operational requirements. `;

        if (greenestRegion.verdict === 'Play On') {
            report += `This region receives the Referee's full endorsement.`;
        } else if (greenestRegion.verdict === 'Yellow Card') {
            report += `While this is the greenest available option, proceed with awareness of the noted concerns.`;
        } else {
            report += `Even as the greenest option, this region has significant issues that require attention.`;
        }

        report += '\n\n';
        report += '═'.repeat(60) + '\n';
        report += `📝 Report generated by Region Arbitrator v1.0\n`;
        report += `🕐 Timestamp: ${timestamp}\n`;

        return report;
    }

    /**
     * Get emoji representation for verdict types
     */
    private getVerdictEmoji(verdict: string): string {
        switch (verdict) {
            case 'Play On': return '🟢';
            case 'Yellow Card': return '🟡';
            case 'Red Card': return '🔴';
            case 'Blue Card': return '🔵';
            default: return '⚪';
        }
    }
}