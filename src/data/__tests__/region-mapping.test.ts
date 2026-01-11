import { RegionDataCollector } from '../DataCollector';
import { CloudRegion } from '../../types/index';
import * as fs from 'fs';
import * as path from 'path';

describe('Region Mapping', () => {
    let dataCollector: RegionDataCollector;

    beforeEach(() => {
        dataCollector = new RegionDataCollector();
    });

    it('should load region mapping file correctly', () => {
        const mappingPath = path.join(__dirname, '..', 'region-mapping.json');
        expect(fs.existsSync(mappingPath)).toBe(true);

        const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
        expect(mapping).toBeDefined();
        expect(typeof mapping).toBe('object');
    });

    it('should have correct zone mappings for AWS regions', () => {
        const mappingPath = path.join(__dirname, '..', 'region-mapping.json');
        const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

        // Test the specific mappings requested
        expect(mapping['us-east-1']).toBe('US-MIDA-PJM');
        expect(mapping['us-west-2']).toBe('US-NW-PACW');
        expect(mapping['eu-west-1']).toBe('IE');
        expect(mapping['eu-central-1']).toBe('DE');
        expect(mapping['ap-northeast-1']).toBe('JP-ON');
        expect(mapping['ap-southeast-1']).toBe('SG');
        expect(mapping['ca-central-1']).toBe('CA-QC');
        expect(mapping['eu-north-1']).toBe('SE-SE3');
        expect(mapping['sa-east-1']).toBe('BR-CS');
        expect(mapping['ap-south-1']).toBe('IN-WE');
    });

    it('should return different carbon data for different regions', async () => {
        const usEastRegion: CloudRegion = {
            provider: 'AWS',
            regionCode: 'us-east-1',
            displayName: 'US East (Virginia)',
            location: { country: 'US', latitude: 39.0458, longitude: -77.5091 }
        };

        const usWestRegion: CloudRegion = {
            provider: 'AWS',
            regionCode: 'us-west-2',
            displayName: 'US West (Oregon)',
            location: { country: 'US', latitude: 45.5152, longitude: -122.6784 }
        };

        const usEastData = await dataCollector.getCarbonData(usEastRegion);
        const usWestData = await dataCollector.getCarbonData(usWestRegion);

        // US West should have better carbon metrics than US East (based on our mock data)
        expect(usWestData.carbonIntensity).toBeLessThan(usEastData.carbonIntensity);
        expect(usWestData.renewablePercentage).toBeGreaterThan(usEastData.renewablePercentage);
    });

    it('should handle unknown regions gracefully', async () => {
        const unknownRegion: CloudRegion = {
            provider: 'AWS',
            regionCode: 'unknown-region',
            displayName: 'Unknown Region',
            location: { country: 'XX', latitude: 0, longitude: 0 }
        };

        const carbonData = await dataCollector.getCarbonData(unknownRegion);

        expect(carbonData).toBeDefined();
        expect(carbonData.carbonIntensity).toBeGreaterThan(0);
        expect(carbonData.renewablePercentage).toBeGreaterThanOrEqual(0);
        expect(carbonData.dataSource).toBe('Mock Data');
    });
});