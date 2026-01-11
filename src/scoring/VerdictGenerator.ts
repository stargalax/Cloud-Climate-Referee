import {
    VerdictGenerator,
    CompositeScore,
    CloudRegion,
    ArbitratorVerdict,
    GreenSuggestion,
    LatencyScore,
    CarbonScore,
    CostScore,
    DataCollectionError
} from '../types/index';

/**
 * Referee Verdict Generator - Issues official verdicts based on composite scores
 * 
 * Verdict Thresholds:
 * - Red Card: < 40 points (or any individual factor < 30)
 * - Yellow Card: 40-70 points
 * - Play On: > 70 points
 * 
 * The Referee emphasizes ethical costs and pragmatic green choices.
 */
export class RegionVerdictGenerator implements VerdictGenerator {
    private readonly RED_CARD_THRESHOLD = 40;
    private readonly YELLOW_CARD_THRESHOLD = 70;
    private readonly INDIVIDUAL_RED_CARD_THRESHOLD = 30;

    /**
     * Generate a referee verdict based on composite score and individual factor scores
     * Handles Blue Card scenarios for data unavailability
     */
    generateVerdict(
        score: CompositeScore,
        region: CloudRegion,
        individualScores?: {
            latency: LatencyScore;
            carbon: CarbonScore;
            cost: CostScore;
        },
        availableRegions?: CloudRegion[],
        regionScores?: Map<string, { carbon: CarbonScore; latency: LatencyScore; cost: CostScore }>,
        dataError?: Error
    ): ArbitratorVerdict {
        // Check for Blue Card scenario (data unavailability)
        if (dataError && dataError.name === 'DataCollectionError') {
            return this.generateBlueCardVerdict(region, dataError);
        }

        const verdict = this.determineVerdict(score, individualScores);
        const reason = this.generateReason(score, verdict, individualScores);
        const suggestion = this.suggestGreenAlternative(region, availableRegions, regionScores);
        const refereeConfidence = this.calculateRefereeConfidence(individualScores);

        return {
            region,
            verdict,
            reason,
            suggestion,
            scores: {
                latency: individualScores?.latency || this.createDefaultLatencyScore(),
                carbon: individualScores?.carbon || this.createDefaultCarbonScore(),
                cost: individualScores?.cost || this.createDefaultCostScore(),
                composite: score
            },
            timestamp: new Date(),
            refereeConfidence
        };
    }

    /**
     * Determine verdict based on scoring thresholds and Red Card Rule
     */
    private determineVerdict(
        score: CompositeScore,
        individualScores?: {
            latency: LatencyScore;
            carbon: CarbonScore;
            cost: CostScore;
        }
    ): 'Red Card' | 'Yellow Card' | 'Play On' {
        // Check Red Card Rule: Any individual factor < 30 = Automatic Red Card
        if (individualScores) {
            const hasRedCardFactor =
                individualScores.latency.score < this.INDIVIDUAL_RED_CARD_THRESHOLD ||
                individualScores.carbon.score < this.INDIVIDUAL_RED_CARD_THRESHOLD ||
                individualScores.cost.score < this.INDIVIDUAL_RED_CARD_THRESHOLD;

            if (hasRedCardFactor) {
                return 'Red Card';
            }
        }

        // Standard thresholds
        if (score.overallScore < this.RED_CARD_THRESHOLD) {
            return 'Red Card';
        } else if (score.overallScore <= this.YELLOW_CARD_THRESHOLD) {
            return 'Yellow Card';
        } else {
            return 'Play On';
        }
    }

    /**
     * Generate authoritative referee reasoning with ethical emphasis and specific factor analysis
     */
    private generateReason(
        score: CompositeScore,
        verdict: 'Red Card' | 'Yellow Card' | 'Play On',
        individualScores?: {
            latency: LatencyScore;
            carbon: CarbonScore;
            cost: CostScore;
        }
    ): string {
        const overallScore = Math.round(score.overallScore);
        let reason = '';

        switch (verdict) {
            case 'Red Card':
                reason = this.generateRedCardReason(score, individualScores);
                break;

            case 'Yellow Card':
                reason = this.generateYellowCardReason(score, individualScores);
                break;

            case 'Play On':
                reason = this.generatePlayOnReason(score, individualScores);
                break;

            default:
                reason = `The Referee has evaluated this region with a score of ${overallScore}/100.`;
        }

        // Add referee confidence based on data quality
        if (individualScores) {
            const refereeConfidence = this.calculateRefereeConfidence(individualScores);
            reason += ` Referee Confidence: ${refereeConfidence}.`;
        }

        return reason;
    }

    /**
     * Generate detailed Yellow Card reasoning with specific factor analysis
     */
    private generateYellowCardReason(
        score: CompositeScore,
        individualScores?: {
            latency: LatencyScore;
            carbon: CarbonScore;
            cost: CostScore;
        }
    ): string {
        const overallScore = Math.round(score.overallScore);
        let reason = `The Referee has reviewed your choice and issues a Yellow Card (${overallScore}/100). `;

        if (individualScores) {
            // Identify the primary concerns
            const concerns: string[] = [];
            const strengths: string[] = [];

            if (individualScores.carbon.score < 50) {
                concerns.push(`carbon intensity is concerning (${Math.round(individualScores.carbon.score)}/100, ${individualScores.carbon.category})`);
            } else if (individualScores.carbon.score >= 70) {
                strengths.push(`good carbon performance (${Math.round(individualScores.carbon.score)}/100, ${individualScores.carbon.category})`);
            }

            if (individualScores.latency.score < 50) {
                concerns.push(`latency performance needs attention (${Math.round(individualScores.latency.score)}/100, ${individualScores.latency.category})`);
            } else if (individualScores.latency.score >= 70) {
                strengths.push(`solid latency performance (${Math.round(individualScores.latency.score)}/100, ${individualScores.latency.category})`);
            }

            if (individualScores.cost.score < 50) {
                concerns.push(`cost efficiency could be better (${Math.round(individualScores.cost.score)}/100, ${individualScores.cost.category})`);
            } else if (individualScores.cost.score >= 70) {
                strengths.push(`cost-effective pricing (${Math.round(individualScores.cost.score)}/100, ${individualScores.cost.category})`);
            }

            if (concerns.length > 0) {
                reason += `Primary concerns: ${concerns.join(', ')}. `;
            }
            if (strengths.length > 0) {
                reason += `Positive aspects: ${strengths.join(', ')}. `;
            }

            reason += `Factor breakdown - Carbon: ${Math.round(score.weightedBreakdown.carbon)}pts, ` +
                `Latency: ${Math.round(score.weightedBreakdown.latency)}pts, ` +
                `Cost: ${Math.round(score.weightedBreakdown.cost)}pts. `;
        }

        reason += `This region shows mixed performance across factors. Proceed with caution and consider the green alternative.`;
        return reason;
    }

    /**
     * Generate detailed Play On reasoning with specific factor analysis
     */
    private generatePlayOnReason(
        score: CompositeScore,
        individualScores?: {
            latency: LatencyScore;
            carbon: CarbonScore;
            cost: CostScore;
        }
    ): string {
        const overallScore = Math.round(score.overallScore);
        let reason = `The Referee approves this choice with a Play On verdict (${overallScore}/100). `;

        if (individualScores) {
            // Highlight the strongest factors
            const excellentFactors: string[] = [];
            const goodFactors: string[] = [];

            if (individualScores.carbon.score >= 80) {
                excellentFactors.push(`exceptional carbon performance (${Math.round(individualScores.carbon.score)}/100, ${Math.round(individualScores.carbon.renewablePercentage)}% renewable)`);
            } else if (individualScores.carbon.score >= 60) {
                goodFactors.push(`solid carbon footprint (${Math.round(individualScores.carbon.score)}/100, ${individualScores.carbon.category})`);
            }

            if (individualScores.latency.score >= 80) {
                excellentFactors.push(`excellent latency performance (${Math.round(individualScores.latency.score)}/100, ${individualScores.latency.category})`);
            } else if (individualScores.latency.score >= 60) {
                goodFactors.push(`good latency performance (${Math.round(individualScores.latency.score)}/100, ${individualScores.latency.category})`);
            }

            if (individualScores.cost.score >= 80) {
                excellentFactors.push(`very cost-effective (${Math.round(individualScores.cost.score)}/100, ${individualScores.cost.category})`);
            } else if (individualScores.cost.score >= 60) {
                goodFactors.push(`reasonable cost structure (${Math.round(individualScores.cost.score)}/100, ${individualScores.cost.category})`);
            }

            if (excellentFactors.length > 0) {
                reason += `Outstanding qualities: ${excellentFactors.join(', ')}. `;
            }
            if (goodFactors.length > 0) {
                reason += `Strong performance in: ${goodFactors.join(', ')}. `;
            }

            reason += `Factor breakdown - Carbon: ${Math.round(score.weightedBreakdown.carbon)}pts, ` +
                `Latency: ${Math.round(score.weightedBreakdown.latency)}pts, ` +
                `Cost: ${Math.round(score.weightedBreakdown.cost)}pts. `;
        }

        reason += `This represents a pragmatic balance of performance and sustainability.`;
        return reason;
    }

    /**
     * Generate Red Card reasoning with emphasis on ethical costs and specific factor analysis
     */
    private generateRedCardReason(
        score: CompositeScore,
        individualScores?: {
            latency: LatencyScore;
            carbon: CarbonScore;
            cost: CostScore;
        }
    ): string {
        const overallScore = Math.round(score.overallScore);
        let reason = `The Referee issues a Red Card (${overallScore}/100). `;

        // Check which factor triggered the Red Card and provide specific analysis
        if (individualScores) {
            if (individualScores.carbon.score < this.INDIVIDUAL_RED_CARD_THRESHOLD) {
                reason += `The carbon intensity is unacceptably high (${Math.round(individualScores.carbon.score)}/100, ${individualScores.carbon.category}). ` +
                    `With only ${Math.round(individualScores.carbon.renewablePercentage)}% renewable energy, ` +
                    `this choice significantly contributes to environmental degradation. ` +
                    `The Referee cannot sanction this environmental cost. `;
            } else if (individualScores.latency.score < this.INDIVIDUAL_RED_CARD_THRESHOLD) {
                reason += `The latency performance is critically poor (${Math.round(individualScores.latency.score)}/100, ${individualScores.latency.category}). ` +
                    `This will severely impact user experience and application responsiveness. ` +
                    `The performance trade-off is unacceptable for production workloads. `;
            } else if (individualScores.cost.score < this.INDIVIDUAL_RED_CARD_THRESHOLD) {
                reason += `The cost structure is prohibitively expensive (${Math.round(individualScores.cost.score)}/100, ${individualScores.cost.category}). ` +
                    `With a relative cost index of ${individualScores.cost.relativeCostIndex.toFixed(2)}, ` +
                    `this choice lacks financial justification and will strain operational budgets. `;
            } else {
                // Overall score triggered Red Card
                reason += `The overall performance is inadequate across multiple factors. `;

                const weakFactors: string[] = [];
                if (individualScores.carbon.score < 40) {
                    weakFactors.push(`carbon impact (${Math.round(individualScores.carbon.score)}/100)`);
                }
                if (individualScores.latency.score < 40) {
                    weakFactors.push(`latency performance (${Math.round(individualScores.latency.score)}/100)`);
                }
                if (individualScores.cost.score < 40) {
                    weakFactors.push(`cost efficiency (${Math.round(individualScores.cost.score)}/100)`);
                }

                if (weakFactors.length > 0) {
                    reason += `Particularly concerning: ${weakFactors.join(', ')}. `;
                }
            }

            reason += `Factor breakdown - Carbon: ${Math.round(score.weightedBreakdown.carbon)}pts, ` +
                `Latency: ${Math.round(score.weightedBreakdown.latency)}pts, ` +
                `Cost: ${Math.round(score.weightedBreakdown.cost)}pts. `;
        }

        reason += `The Referee strongly advises against this region. Consider the green alternative for a more sustainable and balanced choice.`;
        return reason;
    }

    /**
     * Suggest green alternatives with pragmatic focus and region prioritization
     */
    suggestGreenAlternative(
        region: CloudRegion,
        availableRegions?: CloudRegion[],
        regionScores?: Map<string, { carbon: CarbonScore; latency: LatencyScore; cost: CostScore }>
    ): GreenSuggestion {
        // If we have available regions and their scores, try to find a better alternative
        if (availableRegions && regionScores) {
            const betterAlternative = this.findBetterGreenAlternative(region, availableRegions, regionScores);
            if (betterAlternative) {
                return betterAlternative;
            }
        }

        // Fallback to optimization strategies when no better regions exist
        return this.generateOptimizationStrategy(region);
    }

    /**
     * Find a better green alternative from available regions
     */
    private findBetterGreenAlternative(
        currentRegion: CloudRegion,
        availableRegions: CloudRegion[],
        regionScores: Map<string, { carbon: CarbonScore; latency: LatencyScore; cost: CostScore }>
    ): GreenSuggestion | null {
        const currentScores = regionScores.get(currentRegion.regionCode);
        if (!currentScores) return null;

        // Find regions with better carbon scores that maintain acceptable latency (>= 50 score, roughly 100ms)
        const greenAlternatives = availableRegions
            .filter(r => r.regionCode !== currentRegion.regionCode)
            .map(r => {
                const scores = regionScores.get(r.regionCode);
                return scores ? { region: r, scores } : null;
            })
            .filter((item): item is { region: CloudRegion; scores: { carbon: CarbonScore; latency: LatencyScore; cost: CostScore } } =>
                item !== null
            )
            .filter(item =>
                item.scores.carbon.score > currentScores.carbon.score && // Better carbon score
                item.scores.latency.score >= 50 // Maintain acceptable latency (roughly 100ms threshold)
            )
            .sort((a, b) => {
                // Prioritize by carbon score first, then by latency
                const carbonDiff = b.scores.carbon.score - a.scores.carbon.score;
                if (Math.abs(carbonDiff) > 5) return carbonDiff;
                return b.scores.latency.score - a.scores.latency.score;
            });

        if (greenAlternatives.length > 0) {
            const bestAlternative = greenAlternatives[0];
            const carbonImprovement = Math.round(bestAlternative.scores.carbon.score - currentScores.carbon.score);
            const latencyImpact = Math.round(bestAlternative.scores.latency.score - currentScores.latency.score);

            return {
                type: 'alternative_region',
                description: `The Referee recommends ${bestAlternative.region.displayName} as a Pragmatic Green alternative. ` +
                    `This region offers ${carbonImprovement} points better carbon performance ` +
                    `${latencyImpact >= 0 ? `with ${latencyImpact} points better latency` : `with only ${Math.abs(latencyImpact)} points latency trade-off`}. ` +
                    `Carbon category: ${bestAlternative.scores.carbon.category}, ` +
                    `Renewable energy: ${Math.round(bestAlternative.scores.carbon.renewablePercentage)}%.`,
                alternativeRegion: bestAlternative.region,
                expectedImpact: `${carbonImprovement} point carbon improvement while maintaining acceptable performance`
            };
        }

        return null;
    }

    /**
     * Generate optimization strategy when no better regions exist
     */
    private generateOptimizationStrategy(region: CloudRegion): GreenSuggestion {
        return {
            type: 'optimization_strategy',
            description: `The Referee finds no better regional alternatives available. ` +
                `Focus on optimization strategies: implement efficient caching to reduce compute load, ` +
                `use auto-scaling to minimize idle resources, consider serverless architectures for variable workloads, ` +
                `and schedule batch processing during low-carbon grid hours. ` +
                `Monitor ${region.displayName}'s renewable energy adoption for future improvements.`,
            expectedImpact: 'Reduced carbon footprint through operational efficiency while maintaining current regional choice'
        };
    }

    /**
     * Create default latency score for cases where individual scores aren't provided
     */
    private createDefaultLatencyScore(): LatencyScore {
        return {
            score: 50,
            confidence: 0.5,
            reasoning: 'Default latency score - individual analysis not provided',
            category: 'acceptable'
        };
    }

    /**
     * Create default carbon score for cases where individual scores aren't provided
     */
    private createDefaultCarbonScore(): CarbonScore {
        return {
            score: 50,
            confidence: 0.5,
            reasoning: 'Default carbon score - individual analysis not provided',
            category: 'moderate',
            renewablePercentage: 50
        };
    }

    /**
     * Generate Blue Card verdict for data unavailability scenarios
     */
    private generateBlueCardVerdict(region: CloudRegion, dataError: Error): ArbitratorVerdict {
        const reason = `The Referee issues a Blue Card (Technical Timeout) for ${region.displayName}. ` +
            `${dataError.message}. This region is temporarily un-arbitrated due to data unavailability. ` +
            `The Referee cannot make a fair assessment without reliable data sources. ` +
            `Please try again later or contact your data provider.`;

        const suggestion: GreenSuggestion = {
            type: 'optimization_strategy',
            description: `The Referee recommends selecting an alternative region with available data sources, ` +
                `or waiting for data connectivity to be restored. Consider regions with established ` +
                `monitoring infrastructure for more reliable assessments.`,
            expectedImpact: 'Avoid regions with data collection issues for consistent evaluation'
        };

        return {
            region,
            verdict: 'Blue Card',
            reason,
            suggestion,
            scores: {
                latency: this.createDefaultLatencyScore(),
                carbon: this.createDefaultCarbonScore(),
                cost: this.createDefaultCostScore(),
                composite: {
                    overallScore: 0,
                    weightedBreakdown: { latency: 0, carbon: 0, cost: 0 },
                    confidence: 0
                }
            },
            timestamp: new Date(),
            refereeConfidence: 'Low'
        };
    }

    /**
     * Calculate overall referee confidence based on individual factor confidence scores
     * Implements requirement: High/Medium/Low confidence based on data freshness
     */
    private calculateRefereeConfidence(individualScores?: {
        latency: LatencyScore;
        carbon: CarbonScore;
        cost: CostScore;
    }): 'High' | 'Medium' | 'Low' {
        if (!individualScores) {
            return 'Low';
        }

        // Calculate average confidence across all factors
        const avgConfidence = (
            individualScores.latency.confidence +
            individualScores.carbon.confidence +
            individualScores.cost.confidence
        ) / 3;

        // Map confidence to referee confidence levels
        if (avgConfidence >= 0.8) {
            return 'High';
        } else if (avgConfidence >= 0.6) {
            return 'Medium';
        } else {
            return 'Low';
        }
    }

    /**
     * Create default cost score for cases where individual scores aren't provided
     */
    private createDefaultCostScore(): CostScore {
        return {
            score: 50,
            confidence: 0.5,
            reasoning: 'Default cost score - individual analysis not provided',
            category: 'moderate',
            relativeCostIndex: 1.0
        };
    }
}