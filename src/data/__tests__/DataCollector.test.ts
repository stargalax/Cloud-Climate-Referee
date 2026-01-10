import { RegionDataCollector } from '../DataCollector';
import { CloudRegion } from '../../types/index';

describe('RegionDataCollector', () => {
    let dataCollector: RegionDataCollector;
    let mockRegion: CloudRegion;

    beforeEach(() => {
        dataCollector = new RegionDataCollector();
        mockRegion = {
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
    });

    describe('getLatencyData', () => {
        it('should return valid latency metrics', async () => {
            const result = await dataCollector.getLatencyData(mockRegion);

            expect(result).toBeDefined();
            expect(result.averageLatency).toBeGreaterThan(0);
            expect(result.p95Latency).toBeGreaterThan(result.averageLatency);
            expect(result.measurementTimestamp).toBeInstanceOf(Date);
            expect(result.sourceLocation).toBeDefined();
        });
    });

    describe('getCarbonData', () => {
        it('should return valid carbon metrics', async () => {
            const result = await dataCollector.getCarbonData(mockRegion);

            expect(result).toBeDefined();
            expect(result.carbonIntensity).toBeGreaterThanOrEqual(0);
            expect(result.renewablePercentage).toBeGreaterThanOrEqual(0);
            expect(result.renewablePercentage).toBeLessThanOrEqual(100);
            expect(result.dataSource).toBeDefined();
            expect(result.lastUpdated).toBeInstanceOf(Date);
        });
    });

    describe('getCostData', () => {
        it('should return valid cost metrics', async () => {
            const result = await dataCollector.getCostData(mockRegion);

            expect(result).toBeDefined();
            expect(result.computeCostPerHour).toBeGreaterThan(0);
            expect(result.storageCostPerGB).toBeGreaterThan(0);
            expect(result.networkCostPerGB).toBeGreaterThan(0);
            expect(result.region).toBe(mockRegion.regionCode);
        });
    });
});