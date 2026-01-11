import { CloudRegionArbitrator, CloudRegion } from '../src/index';

/**
 * Comprehensive demonstration of the Referee Match Report functionality
 * Shows the integrated multi-region evaluation with formatted output
 */
async function demonstrateRefereeMatchReport() {
    console.log('🏟️  REFEREE MATCH REPORT DEMONSTRATION\n');

    // Initialize the arbitrator with referee-focused weights
    const arbitrator = new CloudRegionArbitrator();

    // Configure weights according to referee logic: Carbon 40%, Latency 40%, Cost 20%
    arbitrator.configureWeights({
        carbon: 0.4,   // 40% - Environmental responsibility
        latency: 0.4,  // 40% - Performance requirements  
        cost: 0.2      // 20% - Cost consideration
    });

    // Define comprehensive test regions using our region-mapping.json
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
        },
        {
            provider: 'AWS',
            regionCode: 'eu-central-1',
            displayName: 'Europe (Frankfurt)',
            location: {
                country: 'DE',
                city: 'Frankfurt',
                latitude: 50.1109,
                longitude: 8.6821
            }
        },
        {
            provider: 'AWS',
            regionCode: 'ap-northeast-1',
            displayName: 'Asia Pacific (Tokyo)',
            location: {
                country: 'JP',
                city: 'Tokyo',
                latitude: 35.6762,
                longitude: 139.6503
            }
        },
        {
            provider: 'AWS',
            regionCode: 'eu-north-1',
            displayName: 'Europe (Stockholm)',
            location: {
                country: 'SE',
                city: 'Stockholm',
                latitude: 59.3293,
                longitude: 18.0686
            }
        }
    ];

    console.log('🔄 Evaluating regions in parallel using region-mapping.json...\n');

    try {
        // Perform multi-region evaluation with parallel data collection
        const verdicts = await arbitrator.evaluateMultipleRegions(regions);

        // Generate and display the Referee Match Report
        const matchReport = arbitrator.formatMatchReport(
            verdicts,
            'Global Cloud Region Assessment - Production Workload'
        );

        console.log(matchReport);

        // Demonstrate different weight configurations
        console.log('\n🔧 ALTERNATIVE CONFIGURATION DEMO\n');
        console.log('═'.repeat(60));

        // Configure for latency-focused evaluation (gaming/real-time applications)
        arbitrator.configureWeights({
            latency: 0.6,  // 60% - Critical for real-time performance
            carbon: 0.25,  // 25% - Still important but secondary
            cost: 0.15     // 15% - Minimal consideration
        });

        console.log('🎮 Evaluating with Latency-Focused Configuration (Gaming/Real-time)');
        console.log('Weights: Latency 60%, Carbon 25%, Cost 15%\n');

        const latencyFocusedVerdicts = await arbitrator.evaluateMultipleRegions(regions.slice(0, 3));
        const latencyReport = arbitrator.formatMatchReport(
            latencyFocusedVerdicts,
            'Gaming Application - Latency Priority'
        );

        console.log(latencyReport);

        // Configure for maximum environmental focus
        arbitrator.configureWeights({
            carbon: 0.7,   // 70% - Maximum environmental priority
            latency: 0.2,  // 20% - Minimum acceptable performance
            cost: 0.1      // 10% - Cost is secondary to environment
        });

        console.log('🌱 Evaluating with Maximum Environmental Focus');
        console.log('Weights: Carbon 70%, Latency 20%, Cost 10%\n');

        const greenFocusedVerdicts = await arbitrator.evaluateMultipleRegions(regions.slice(0, 4));
        const greenReport = arbitrator.formatMatchReport(
            greenFocusedVerdicts,
            'Sustainability Initiative - Carbon Priority'
        );

        console.log(greenReport);

        // Demonstrate single region detailed analysis
        console.log('\n🔍 SINGLE REGION DETAILED ANALYSIS\n');
        console.log('═'.repeat(60));

        // Reset to balanced configuration
        arbitrator.configureWeights({
            carbon: 0.4,
            latency: 0.4,
            cost: 0.2
        });

        const singleVerdict = await arbitrator.evaluateRegion(regions[0]);
        console.log(`📍 Detailed Analysis: ${singleVerdict.region.displayName}`);
        console.log('─'.repeat(50));
        console.log(`🎯 Verdict: ${singleVerdict.verdict}`);
        console.log(`📊 Overall Score: ${Math.round(singleVerdict.scores.composite.overallScore)}/100`);
        console.log(`🎯 Referee Confidence: ${singleVerdict.refereeConfidence}`);
        console.log();
        console.log('📈 Factor Breakdown:');
        console.log(`   🌿 Carbon: ${Math.round(singleVerdict.scores.carbon.score)}/100 (${singleVerdict.scores.carbon.category})`);
        console.log(`      └─ Renewable Energy: ${Math.round(singleVerdict.scores.carbon.renewablePercentage)}%`);
        console.log(`   ⚡ Latency: ${Math.round(singleVerdict.scores.latency.score)}/100 (${singleVerdict.scores.latency.category})`);
        console.log(`   💰 Cost: ${Math.round(singleVerdict.scores.cost.score)}/100 (${singleVerdict.scores.cost.category})`);
        console.log();
        console.log('⚖️  Weighted Contributions:');
        console.log(`   🌿 Carbon: ${Math.round(singleVerdict.scores.composite.weightedBreakdown.carbon)} points`);
        console.log(`   ⚡ Latency: ${Math.round(singleVerdict.scores.composite.weightedBreakdown.latency)} points`);
        console.log(`   💰 Cost: ${Math.round(singleVerdict.scores.composite.weightedBreakdown.cost)} points`);
        console.log();
        console.log('💭 Referee Reasoning:');
        console.log(`   ${singleVerdict.reason}`);
        console.log();
        console.log('🌱 Green Suggestion:');
        console.log(`   Type: ${singleVerdict.suggestion.type.replace('_', ' ')}`);
        console.log(`   ${singleVerdict.suggestion.description}`);
        if (singleVerdict.suggestion.expectedImpact) {
            console.log(`   Expected Impact: ${singleVerdict.suggestion.expectedImpact}`);
        }

        console.log('\n✅ Referee Match Report demonstration completed successfully!');
        console.log('\n🏆 KEY FEATURES DEMONSTRATED:');
        console.log('   ✓ Parallel carbon data collection using region-mapping.json');
        console.log('   ✓ Greenest region prioritization in sorting');
        console.log('   ✓ Comprehensive Referee Match Report formatting');
        console.log('   ✓ Multiple weight configuration scenarios');
        console.log('   ✓ Detailed single region analysis');
        console.log('   ✓ Referee-style authoritative tone and reasoning');

    } catch (error) {
        console.error('❌ Error during demonstration:', error);

        if (error instanceof Error) {
            console.error('Error details:', error.message);
            if (error.stack) {
                console.error('Stack trace:', error.stack);
            }
        }
    }
}

// Export for use in other modules
export { demonstrateRefereeMatchReport };

// Run the demonstration if this file is executed directly
if (require.main === module) {
    demonstrateRefereeMatchReport().catch(console.error);
}