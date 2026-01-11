import { CloudRegionArbitrator, CloudRegion } from '../src/index';

/**
 * Demonstration of the main RegionArbitrator interface
 * Shows single region evaluation, multi-region comparison, and Referee Match Reports
 */
async function demonstrateRegionArbitrator() {
    console.log('🏟️  Region Arbitrator Demo - Main Interface\n');

    // Initialize the arbitrator with default settings
    const arbitrator = new CloudRegionArbitrator();

    // Define test regions
    const regions: CloudRegion[] = [
        {
            provider: 'AWS',
            regionCode: 'us-east-1',
            displayName: 'US East (Virginia)',
            location: {
                country: 'US',
                city: 'Virginia',
                latitude: 39.0458,
                longitude: -77.5091
            }
        },
        {
            provider: 'AWS',
            regionCode: 'us-west-2',
            displayName: 'US West (Oregon)',
            location: {
                country: 'US',
                city: 'Oregon',
                latitude: 45.5152,
                longitude: -122.6784
            }
        },
        {
            provider: 'AWS',
            regionCode: 'eu-west-1',
            displayName: 'Europe (Ireland)',
            location: {
                country: 'IE',
                city: 'Dublin',
                latitude: 53.3498,
                longitude: -6.2603
            }
        }
    ];

    // Demonstrate single region evaluation
    console.log('📍 Single Region Evaluation:');
    console.log('='.repeat(50));

    const singleVerdict = await arbitrator.evaluateRegion(regions[0]);
    console.log(`Region: ${singleVerdict.region.displayName}`);
    console.log(`Verdict: ${singleVerdict.verdict}`);
    console.log(`Overall Score: ${singleVerdict.scores.composite.overallScore}/100`);
    console.log(`Reason: ${singleVerdict.reason}`);
    console.log(`Green Suggestion: ${singleVerdict.suggestion.description}`);
    console.log();

    // Demonstrate multi-region evaluation with sorting
    console.log('🌍 Multi-Region Comparison (Sorted by Greenest First):');
    console.log('='.repeat(50));

    const multipleVerdicts = await arbitrator.evaluateMultipleRegions(regions);

    multipleVerdicts.forEach((verdict, index) => {
        console.log(`${index + 1}. ${verdict.region.displayName}`);
        console.log(`   Verdict: ${verdict.verdict} (${verdict.scores.composite.overallScore}/100)`);
        console.log(`   Carbon: ${verdict.scores.carbon.score}/100 (${verdict.scores.carbon.category})`);
        console.log(`   Latency: ${verdict.scores.latency.score}/100 (${verdict.scores.latency.category})`);
        console.log(`   Cost: ${verdict.scores.cost.score}/100 (${verdict.scores.cost.category})`);
        console.log(`   Green Suggestion: ${verdict.suggestion.type}`);
        console.log();
    });

    // Demonstrate Referee Match Report
    console.log('📋 Referee Match Report:');
    console.log('='.repeat(50));

    const matchReport = arbitrator.formatMatchReport(
        multipleVerdicts,
        'Development Environment Setup'
    );
    console.log(matchReport);

    // Demonstrate weight configuration
    console.log('⚖️  Custom Weight Configuration:');
    console.log('='.repeat(50));

    // Configure for carbon-focused evaluation
    arbitrator.configureWeights({
        carbon: 0.6,  // 60% - prioritize environmental impact
        latency: 0.3, // 30% - moderate performance consideration
        cost: 0.1     // 10% - minimal cost consideration
    });

    console.log('Configured for carbon-focused evaluation (60% carbon, 30% latency, 10% cost)');

    const carbonFocusedVerdicts = await arbitrator.evaluateMultipleRegions(regions);
    const carbonFocusedReport = arbitrator.formatMatchReport(
        carbonFocusedVerdicts,
        'Sustainability-Focused Deployment'
    );

    console.log(carbonFocusedReport);

    // Show configuration details
    console.log('🔧 Current Configuration:');
    console.log('='.repeat(50));

    const config = arbitrator.getConfiguration();
    console.log('Weights:', config.weights);
    console.log('Components:', config.components);
    console.log();

    console.log('✅ Demo completed successfully!');
}

// Run the demonstration
demonstrateRegionArbitrator().catch(console.error);