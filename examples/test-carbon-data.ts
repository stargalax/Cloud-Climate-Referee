import { RegionDataCollector } from '../src/data/DataCollector';
import { CloudRegion } from '../src/types/index';

/**
 * Test script to verify carbon data collection for US-MIDA (Virginia)
 */
async function testCarbonDataCollection() {
    console.log('🔍 Testing Carbon Data Collection for US-MIDA (Virginia)...\n');

    // Create a data collector instance (will use .env file for API key)
    const dataCollector = new RegionDataCollector();

    // Define Virginia region (us-east-1 maps to US-MIDA zone)
    const virginiaRegion: CloudRegion = {
        provider: 'AWS',
        regionCode: 'us-east-1',
        displayName: 'US East (N. Virginia)',
        location: {
            country: 'US',
            city: 'Virginia',
            latitude: 39.0458,
            longitude: -77.5081
        }
    };

    try {
        console.log('📍 Region Details:');
        console.log(`   Provider: ${virginiaRegion.provider}`);
        console.log(`   Region Code: ${virginiaRegion.regionCode}`);
        console.log(`   Display Name: ${virginiaRegion.displayName}`);
        console.log(`   Location: ${virginiaRegion.location.city}, ${virginiaRegion.location.country}`);
        console.log(`   Coordinates: ${virginiaRegion.location.latitude}, ${virginiaRegion.location.longitude}\n`);

        console.log('🌱 Fetching carbon intensity data...');
        const carbonData = await dataCollector.getCarbonData(virginiaRegion);

        console.log('\n✅ Carbon Data Retrieved:');
        console.log(`   Carbon Intensity: ${carbonData.carbonIntensity} gCO2/kWh`);
        console.log(`   Renewable Percentage: ${carbonData.renewablePercentage.toFixed(1)}%`);
        console.log(`   Data Source: ${carbonData.dataSource}`);
        console.log(`   Last Updated: ${carbonData.lastUpdated.toISOString()}`);

        // Determine if this is real or mock data
        if (carbonData.dataSource === 'Electricity Maps API') {
            console.log('\n🎉 SUCCESS: Real-time data from Electricity Maps API!');
            console.log('   The API key is working correctly.');
        } else {
            console.log('\n⚠️  MOCK DATA: Using fallback mock data.');
            console.log('   This could mean:');
            console.log('   - No API key provided in .env file');
            console.log('   - Invalid API key');
            console.log('   - API request failed');
            console.log('   - Rate limit exceeded');
        }

    } catch (error) {
        console.error('\n❌ Error testing carbon data collection:', error);
    }
}

// Run the test
testCarbonDataCollection();