import { RegionScoringEngine } from '../src/scoring/ScoringEngine';
import { RegionVerdictGenerator } from '../src/scoring/VerdictGenerator';
import { CloudRegion, LatencyScore, CarbonScore, CostScore } from '../src/types/index';

/**
 * Demonstration of the Scoring Engine and Verdict Generator working together
 * Shows how the Referee evaluates regions and issues verdicts
 */

// Create instances
const scoringEngine = new RegionScoringEngine();
const verdictGenerator = new RegionVerdictGenerator();

// Mock region for testing
const testRegion: CloudRegion = {
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

// Example 1: Play On verdict (good scores across all factors)
console.log('=== Example 1: Play On Verdict ===');
const goodLatency: LatencyScore = {
    score: 85,
    confidence: 0.9,
    reasoning: 'Excellent latency performance with 15ms average response time',
    category: 'excellent'
};

const goodCarbon: CarbonScore = {
    score: 80,
    confidence: 0.9,
    reasoning: 'Clean energy with 75% renewable sources and low carbon intensity',
    category: 'very_clean',
    renewablePercentage: 75
};

const goodCost: CostScore = {
    score: 75,
    confidence: 0.9,
    reasoning: 'Competitive pricing with good value for performance',
    category: 'affordable',
    relativeCostIndex: 0.8
};

const goodComposite = scoringEngine.combineScores(goodLatency, goodCarbon, goodCost);
const goodVerdict = verdictGenerator.generateVerdict(goodComposite, testRegion, {
    latency: goodLatency,
    carbon: goodCarbon,
    cost: goodCost
});

console.log(`Verdict: ${goodVerdict.verdict}`);
console.log(`Overall Score: ${goodComposite.overallScore}/100`);
console.log(`Reason: ${goodVerdict.reason}`);
console.log(`Green Suggestion: ${goodVerdict.suggestion.description}`);
console.log('');

// Example 2: Red Card verdict (poor carbon score triggers Red Card Rule)
console.log('=== Example 2: Red Card Verdict (Environmental) ===');
const okLatency: LatencyScore = {
    score: 70,
    confidence: 0.9,
    reasoning: 'Acceptable latency performance',
    category: 'good'
};

const poorCarbon: CarbonScore = {
    score: 25, // Below 30 - triggers Red Card Rule
    confidence: 0.8,
    reasoning: 'High carbon intensity from coal-heavy grid with minimal renewables',
    category: 'high_carbon',
    renewablePercentage: 15
};

const okCost: CostScore = {
    score: 65,
    confidence: 0.9,
    reasoning: 'Reasonable pricing structure',
    category: 'affordable',
    relativeCostIndex: 1.0
};

const redCardComposite = scoringEngine.combineScores(okLatency, poorCarbon, okCost);
const redCardVerdict = verdictGenerator.generateVerdict(redCardComposite, testRegion, {
    latency: okLatency,
    carbon: poorCarbon,
    cost: okCost
});

console.log(`Verdict: ${redCardVerdict.verdict}`);
console.log(`Overall Score: ${redCardComposite.overallScore}/100`);
console.log(`Reason: ${redCardVerdict.reason}`);
console.log(`Green Suggestion: ${redCardVerdict.suggestion.description}`);
console.log('');

// Example 3: Yellow Card verdict (mixed performance)
console.log('=== Example 3: Yellow Card Verdict (Mixed Performance) ===');
const averageLatency: LatencyScore = {
    score: 55,
    confidence: 0.8,
    reasoning: 'Moderate latency with some variability',
    category: 'acceptable'
};

const averageCarbon: CarbonScore = {
    score: 60,
    confidence: 0.8,
    reasoning: 'Mixed energy sources with moderate carbon intensity',
    category: 'moderate',
    renewablePercentage: 45
};

const averageCost: CostScore = {
    score: 50,
    confidence: 0.8,
    reasoning: 'Standard market pricing',
    category: 'moderate',
    relativeCostIndex: 1.2
};

const yellowComposite = scoringEngine.combineScores(averageLatency, averageCarbon, averageCost);
const yellowVerdict = verdictGenerator.generateVerdict(yellowComposite, testRegion, {
    latency: averageLatency,
    carbon: averageCarbon,
    cost: averageCost
});

console.log(`Verdict: ${yellowVerdict.verdict}`);
console.log(`Overall Score: ${yellowComposite.overallScore}/100`);
console.log(`Reason: ${yellowVerdict.reason}`);
console.log(`Green Suggestion: ${yellowVerdict.suggestion.description}`);
console.log('');

// Example 4: Demonstrate Red Card Rule override
console.log('=== Example 4: Red Card Rule Override ===');
console.log('Even with high overall weighted score, individual factor < 30 triggers Red Card');

const excellentLatency: LatencyScore = {
    score: 95,
    confidence: 0.95,
    reasoning: 'Outstanding latency performance',
    category: 'excellent'
};

const excellentCarbon: CarbonScore = {
    score: 90,
    confidence: 0.95,
    reasoning: 'Exceptional renewable energy usage',
    category: 'very_clean',
    renewablePercentage: 90
};

const terribleCost: CostScore = {
    score: 20, // Below 30 - triggers Red Card Rule
    confidence: 0.9,
    reasoning: 'Prohibitively expensive pricing structure',
    category: 'expensive',
    relativeCostIndex: 3.0
};

const overrideComposite = scoringEngine.combineScores(excellentLatency, excellentCarbon, terribleCost);
const overrideVerdict = verdictGenerator.generateVerdict(overrideComposite, testRegion, {
    latency: excellentLatency,
    carbon: excellentCarbon,
    cost: terribleCost
});

console.log(`Verdict: ${overrideVerdict.verdict}`);
console.log(`Overall Score: ${overrideComposite.overallScore}/100`);
console.log(`Weighted breakdown would be: L=${Math.round(excellentLatency.score * 0.4)}, C=${Math.round(excellentCarbon.score * 0.4)}, Cost=${Math.round(terribleCost.score * 0.2)} = ${Math.round(excellentLatency.score * 0.4 + excellentCarbon.score * 0.4 + terribleCost.score * 0.2)}`);
console.log(`But Red Card Rule caps it at: ${overrideComposite.overallScore}`);
console.log(`Reason: ${overrideVerdict.reason}`);