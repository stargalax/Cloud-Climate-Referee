import { RegionVerdictGenerator } from '../src/scoring/VerdictGenerator';
import { CloudRegion, CompositeScore, LatencyScore, CarbonScore, CostScore } from '../src/types/index';

/**
 * Demonstration of enhanced reasoning and green suggestion generation
 * Shows the improved factor-specific analysis and alternative region prioritization
 */

const verdictGenerator = new RegionVerdictGenerator();

// Mock regions for demonstration
const currentRegion: CloudRegion = {
    provider: 'AWS',
    regionCode: 'us-east-1',
    displayName: 'US East (N. Virginia)',
    location: {
        country: 'United States',
        city: 'Virginia',
        latitude: 39.0458,
        longitude: -77.5081
    }
};

const alternativeRegion: CloudRegion = {
    provider: 'AWS',
    regionCode: 'eu-north-1',
    displayName: 'EU North (Stockholm)',
    location: {
        country: 'Sweden',
        city: 'Stockholm',
        latitude: 59.3293,
        longitude: 18.0686
    }
};

// Create mock scores for demonstration
const createScores = (latencyScore: number, carbonScore: number, costScore: number) => {
    const latency: LatencyScore = {
        score: latencyScore,
        confidence: 0.9,
        reasoning: `Latency analysis: ${latencyScore}/100`,
        category: latencyScore >= 70 ? 'excellent' : latencyScore >= 50 ? 'good' : latencyScore >= 30 ? 'acceptable' : 'poor'
    };

    const carbon: CarbonScore = {
        score: carbonScore,
        confidence: 0.9,
        reasoning: `Carbon analysis: ${carbonScore}/100`,
        category: carbonScore >= 70 ? 'very_clean' : carbonScore >= 50 ? 'clean' : carbonScore >= 30 ? 'moderate' : 'high_carbon',
        renewablePercentage: carbonScore * 0.8
    };

    const cost: CostScore = {
        score: costScore,
        confidence: 0.9,
        reasoning: `Cost analysis: ${costScore}/100`,
        category: costScore >= 70 ? 'very_affordable' : costScore >= 50 ? 'affordable' : costScore >= 30 ? 'moderate' : 'expensive',
        relativeCostIndex: 2 - (costScore / 50)
    };

    const composite: CompositeScore = {
        overallScore: (latencyScore * 0.4) + (carbonScore * 0.4) + (costScore * 0.2),
        weightedBreakdown: {
            latency: latencyScore * 0.4,
            carbon: carbonScore * 0.4,
            cost: costScore * 0.2
        },
        confidence: 0.9
    };

    return { latency, carbon, cost, composite };
};

console.log('=== Enhanced Reasoning and Green Suggestion Demo ===\n');

// Demo 1: Red Card with specific factor analysis
console.log('1. RED CARD - Poor Carbon Performance:');
const redCardScores = createScores(70, 25, 60); // Carbon triggers Red Card
const redCardVerdict = verdictGenerator.generateVerdict(
    redCardScores.composite,
    currentRegion,
    { latency: redCardScores.latency, carbon: redCardScores.carbon, cost: redCardScores.cost }
);
console.log(`Verdict: ${redCardVerdict.verdict}`);
console.log(`Reason: ${redCardVerdict.reason}`);
console.log(`Suggestion: ${redCardVerdict.suggestion.description}\n`);

// Demo 2: Yellow Card with detailed factor breakdown
console.log('2. YELLOW CARD - Mixed Performance:');
const yellowCardScores = createScores(45, 65, 50);
const yellowCardVerdict = verdictGenerator.generateVerdict(
    yellowCardScores.composite,
    currentRegion,
    { latency: yellowCardScores.latency, carbon: yellowCardScores.carbon, cost: yellowCardScores.cost }
);
console.log(`Verdict: ${yellowCardVerdict.verdict}`);
console.log(`Reason: ${yellowCardVerdict.reason}`);
console.log(`Suggestion: ${yellowCardVerdict.suggestion.description}\n`);

// Demo 3: Play On with strength analysis
console.log('3. PLAY ON - Strong Performance:');
const playOnScores = createScores(85, 90, 75);
const playOnVerdict = verdictGenerator.generateVerdict(
    playOnScores.composite,
    currentRegion,
    { latency: playOnScores.latency, carbon: playOnScores.carbon, cost: playOnScores.cost }
);
console.log(`Verdict: ${playOnVerdict.verdict}`);
console.log(`Reason: ${playOnVerdict.reason}`);
console.log(`Suggestion: ${playOnVerdict.suggestion.description}\n`);

// Demo 4: Green Alternative Suggestion
console.log('4. GREEN ALTERNATIVE - Better Region Available:');
const availableRegions = [currentRegion, alternativeRegion];
const regionScores = new Map([
    [currentRegion.regionCode, {
        carbon: createScores(60, 40, 55).carbon,
        latency: createScores(60, 40, 55).latency,
        cost: createScores(60, 40, 55).cost
    }],
    [alternativeRegion.regionCode, {
        carbon: createScores(55, 85, 50).carbon, // Much better carbon
        latency: createScores(55, 85, 50).latency, // Acceptable latency
        cost: createScores(55, 85, 50).cost
    }]
]);

const greenAlternativeScores = createScores(60, 40, 55);
const greenAlternativeVerdict = verdictGenerator.generateVerdict(
    greenAlternativeScores.composite,
    currentRegion,
    { latency: greenAlternativeScores.latency, carbon: greenAlternativeScores.carbon, cost: greenAlternativeScores.cost },
    availableRegions,
    regionScores
);
console.log(`Verdict: ${greenAlternativeVerdict.verdict}`);
console.log(`Reason: ${greenAlternativeVerdict.reason}`);
console.log(`Suggestion Type: ${greenAlternativeVerdict.suggestion.type}`);
console.log(`Suggestion: ${greenAlternativeVerdict.suggestion.description}`);
if (greenAlternativeVerdict.suggestion.alternativeRegion) {
    console.log(`Alternative Region: ${greenAlternativeVerdict.suggestion.alternativeRegion.displayName}`);
}
console.log(`Expected Impact: ${greenAlternativeVerdict.suggestion.expectedImpact}\n`);

console.log('=== Demo Complete ===');
console.log('Enhanced features demonstrated:');
console.log('✓ Detailed factor-specific reasoning');
console.log('✓ Strength and weakness identification');
console.log('✓ Alternative region prioritization');
console.log('✓ Optimization strategy fallbacks');
console.log('✓ Pragmatic Green choice recommendations');