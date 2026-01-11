import { RegionDataCollector } from '../src/data/DataCollector';
import { CloudRegion } from '../src/types/index';

/**
 * Demonstration of the updated API connection with region mapping
 * Shows how the system now uses proper Electricity Maps zone keys
 */
async function demonstrateApiConnection() {
    console.log('🔌 API Connection Demo - Updated Electricity Maps Integration\n');

    // Initialize data collector (will use API key from .env if available)
    const dataCollector = new RegionDataCollector();

    // Test regions with our new mapping
    const testRegions: CloudRegion[] = [
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

    console.log('📍 Region Mapping Verification:');
    console.log('='.repeat(50));
    console.log('us-east-1 → US-MIDA-PJM (Mid-Atlantic PJM)');
    console.log('us-west-2 → US-NW-PACW (Northwest PACW)');
    console.log('eu-west-1 → IE (Ireland)');
    console.log();

    console.log('🌍 Carbon Data Collection:');
    console.log('='.repeat(50));

    for (const region of testRegions) {
        try {
            console.log(`\n${region.displayName} (${region.regionCode}):`);

            const carbonData = await dataCollector.getCarbonData(region);

            console.log(`  Carbon Intensity: ${carbonData.carbonIntensity} gCO2/kWh`);
            console.log(`  Renewable Energy: ${carbonData.renewablePercentage.toFixed(1)}%`);
            console.log(`  Data Source: ${carbonData.dataSource}`);
            console.log(`  Last Updated: ${carbonData.lastUpdated.toISOString()}`);

            // Determine environmental category
            let category = 'Unknown';
            if (carbonData.carbonIntensity <= 100) category = 'Very Clean';
            else if (carbonData.carbonIntensity <= 200) category = 'Clean';
            else if (carbonData.carbonIntensity <= 350) category = 'Moderate';
            else category = 'High Carbon';

            console.log(`  Environmental Category: ${category}`);

        } catch (error) {
            console.log(`  Error: ${error}`);
        }
    }

    console.log('\n🔧 API Configuration:');
    console.log('='.repeat(50));
    console.log('Base URL: https://api.electricitymaps.com/v3');
    console.log('Endpoint: /carbon-intensity/forecast?zone={zoneKey}');
    console.log('Fallback: Power breakdown for renewable percentage');
    console.log('Mock Data: Available when API key not provided or API fails');

    const hasApiKey = process.env.ELECTRICITY_MAPS_API_KEY ? 'Yes' : 'No';
    console.log(`API Key Configured: ${hasApiKey}`);

    if (!process.env.ELECTRICITY_MAPS_API_KEY) {
        console.log('\n💡 To use real data:');
        console.log('1. Get an API key from https://electricitymaps.com');
        console.log('2. Add ELECTRICITY_MAPS_API_KEY=your_key_here to .env file');
        console.log('3. Re-run this demo to see live carbon intensity data');
    }

    console.log('\n✅ API connection demo completed!');
}

// Run the demonstration
demonstrateApiConnection().catch(console.error);