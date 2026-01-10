import { RegionDataCollector, CloudRegion } from '../src/index';

/**
 * Basic usage example for the Region Arbitrator data collection
 */
async function demonstrateDataCollection() {
    // Create a data collector instance
    const dataCollector = new RegionDataCollector();

    // Define a sample cloud region
    const region: CloudRegion = {
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
        console.log('Collecting data for region:', region.displayName);

        // Collect latency data
        const latencyData = await dataCollector.getLatencyData(region);
        console.log('Latency Data:', {
            averageLatency: `${latencyData.averageLatency}ms`,
            p95Latency: `${latencyData.p95Latency}ms`,
            timestamp: latencyData.measurementTimestamp.toISOString()
        });

        // Collect carbon intensity data
        const carbonData = await dataCollector.getCarbonData(region);
        console.log('Carbon Data:', {
            carbonIntensity: `${carbonData.carbonIntensity} gCO2/kWh`,
            renewablePercentage: `${carbonData.renewablePercentage}%`,
            dataSource: carbonData.dataSource,
            lastUpdated: carbonData.lastUpdated.toISOString()
        });

        // Collect cost data
        const costData = await dataCollector.getCostData(region);
        console.log('Cost Data:', {
            computeCost: `$${costData.computeCostPerHour}/hour`,
            storageCost: `$${costData.storageCostPerGB}/GB/month`,
            networkCost: `$${costData.networkCostPerGB}/GB`,
            region: costData.region
        });

    } catch (error) {
        console.error('Error collecting data:', error);
    }
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
    demonstrateDataCollection();
}