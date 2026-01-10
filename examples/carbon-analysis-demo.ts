import { RegionCarbonAnalyzer } from '../src/analyzers/CarbonAnalyzer';
import { CarbonMetrics } from '../src/types/index';

/**
 * Demonstration of Carbon Analysis functionality
 * Shows how the Referee evaluates regions based on environmental impact
 */

const analyzer = new RegionCarbonAnalyzer();

// Example 1: Very clean region (Nordic countries with hydro/wind)
const cleanRegion: CarbonMetrics = {
    carbonIntensity: 45,  // Very low carbon
    renewablePercentage: 95,  // Almost all renewable
    dataSource: 'electricitymaps',
    lastUpdated: new Date()
};

// Example 2: High carbon region (coal-heavy grid)
const dirtyRegion: CarbonMetrics = {
    carbonIntensity: 420,  // Very high carbon
    renewablePercentage: 12,  // Mostly fossil fuels
    dataSource: 'electricitymaps',
    lastUpdated: new Date()
};

// Example 3: Mixed region (moderate carbon, good renewables)
const mixedRegion: CarbonMetrics = {
    carbonIntensity: 180,  // Moderate carbon
    renewablePercentage: 65,  // Good renewable mix
    dataSource: 'electricitymaps',
    lastUpdated: new Date()
};

console.log('=== Carbon Analysis Demonstration ===\n');

console.log('1. Clean Region (Nordic-style):');
const cleanResult = analyzer.analyzeCarbonImpact(cleanRegion);
console.log(`   Score: ${cleanResult.score}/100`);
console.log(`   Category: ${cleanResult.category}`);
console.log(`   Confidence: ${(cleanResult.confidence * 100).toFixed(1)}%`);
console.log(`   Reasoning: ${cleanResult.reasoning}\n`);

console.log('2. High Carbon Region (Coal-heavy):');
const dirtyResult = analyzer.analyzeCarbonImpact(dirtyRegion);
console.log(`   Score: ${dirtyResult.score}/100`);
console.log(`   Category: ${dirtyResult.category}`);
console.log(`   Confidence: ${(dirtyResult.confidence * 100).toFixed(1)}%`);
console.log(`   Reasoning: ${dirtyResult.reasoning}\n`);

console.log('3. Mixed Region (Moderate):');
const mixedResult = analyzer.analyzeCarbonImpact(mixedRegion);
console.log(`   Score: ${mixedResult.score}/100`);
console.log(`   Category: ${mixedResult.category}`);
console.log(`   Confidence: ${(mixedResult.confidence * 100).toFixed(1)}%`);
console.log(`   Reasoning: ${mixedResult.reasoning}\n`);

console.log('=== Referee Scoring Logic ===');
console.log('Carbon normalization: 0g CO2/kWh = 100 points, 500g CO2/kWh = 0 points');
console.log('Renewable bonus: Up to +15 points for high renewable percentage');
console.log('Renewable penalty: Up to -10 points for very low renewable percentage');
console.log('Red Card threshold: Any score < 30 triggers automatic Red Card\n');

// Show thresholds
const thresholds = analyzer.getThresholds();
const renewableThresholds = analyzer.getRenewableThresholds();

console.log('Carbon Intensity Thresholds:');
console.log(`   Very Clean: ≤ ${thresholds.veryClean}g CO2/kWh`);
console.log(`   Clean: ≤ ${thresholds.clean}g CO2/kWh`);
console.log(`   Moderate: ≤ ${thresholds.moderate}g CO2/kWh`);
console.log(`   High Carbon: > ${thresholds.moderate}g CO2/kWh\n`);

console.log('Renewable Energy Thresholds:');
console.log(`   High: ≥ ${renewableThresholds.high}%`);
console.log(`   Good: ≥ ${renewableThresholds.good}%`);
console.log(`   Low: ≥ ${renewableThresholds.low}%`);
console.log(`   Very Low: < ${renewableThresholds.low}%`);