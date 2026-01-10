import {
    DataCollector,
    CloudRegion,
    LatencyMetrics,
    CarbonMetrics,
    CostMetrics
} from '../types/index.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * DataCollector implementation with Electricity Maps API integration
 * Handles data collection for latency, carbon intensity, and cost metrics
 */
export class RegionDataCollector implements DataCollector {
    private electricityMapsApiKey?: string;
    private baseElectricityMapsUrl = 'https://api.electricitymap.org/v3';

    constructor(electricityMapsApiKey?: string) {
        // Use provided API key, or fall back to environment variable
        this.electricityMapsApiKey = electricityMapsApiKey || process.env.ELECTRICITY_MAPS_API_KEY;
    }

    /**
     * Collect latency data for a given region
     * Currently returns mock data - would integrate with actual latency measurement service
     */
    async getLatencyData(region: CloudRegion): Promise<LatencyMetrics> {
        // TODO: Integrate with actual latency measurement service
        // For now, return mock data based on geographic location
        const mockLatency = this.calculateMockLatency(region);

        return {
            averageLatency: mockLatency,
            p95Latency: mockLatency * 1.5,
            measurementTimestamp: new Date(),
            sourceLocation: `mock-${region.regionCode}` // Include region code for analyzer
        };
    }

    /**
     * Collect carbon intensity data using Electricity Maps API
     */
    async getCarbonData(region: CloudRegion): Promise<CarbonMetrics> {
        try {
            // Map cloud region to Electricity Maps zone code
            const zoneCode = this.mapRegionToZoneCode(region);

            if (!this.electricityMapsApiKey) {
                // Return mock data if no API key provided
                return this.getMockCarbonData(region);
            }

            // Fetch current carbon intensity from Electricity Maps
            const response = await fetch(
                `${this.baseElectricityMapsUrl}/carbon-intensity/latest?zone=${zoneCode}`,
                {
                    headers: {
                        'auth-token': this.electricityMapsApiKey
                    }
                }
            );

            if (!response.ok) {
                console.warn(`Electricity Maps API error: ${response.status}. Using mock data.`);
                return this.getMockCarbonData(region);
            }

            const data = await response.json() as any;

            // Fetch renewable percentage
            const renewableResponse = await fetch(
                `${this.baseElectricityMapsUrl}/power-breakdown/latest?zone=${zoneCode}`,
                {
                    headers: {
                        'auth-token': this.electricityMapsApiKey
                    }
                }
            );

            let renewablePercentage = 0;
            if (renewableResponse.ok) {
                const renewableData = await renewableResponse.json() as any;
                renewablePercentage = this.calculateRenewablePercentage(renewableData.powerConsumptionBreakdown);
            }

            return {
                carbonIntensity: data.carbonIntensity || 0,
                renewablePercentage,
                dataSource: 'Electricity Maps API',
                lastUpdated: new Date(data.datetime)
            };

        } catch (error) {
            console.warn('Failed to fetch carbon data from Electricity Maps:', error);
            return this.getMockCarbonData(region);
        }
    }

    /**
     * Collect cost data for a given region
     * Currently returns mock data - would integrate with cloud provider pricing APIs
     */
    async getCostData(region: CloudRegion): Promise<CostMetrics> {
        // TODO: Integrate with actual cloud provider pricing APIs
        // For now, return mock data based on region and provider
        const mockCosts = this.calculateMockCosts(region);

        return {
            computeCostPerHour: mockCosts.compute,
            storageCostPerGB: mockCosts.storage,
            networkCostPerGB: mockCosts.network,
            region: region.regionCode
        };
    }

    /**
     * Calculate mock latency based on geographic distance
     * This is a simplified approximation for testing purposes
     */
    private calculateMockLatency(region: CloudRegion): number {
        // Mock calculation based on distance from a reference point (e.g., US East Coast)
        const referenceLatitude = 39.0458; // Washington DC
        const referenceLongitude = -76.6413;

        const distance = this.calculateDistance(
            referenceLatitude,
            referenceLongitude,
            region.location.latitude,
            region.location.longitude
        );

        // Rough approximation: 1ms per 100km + base latency
        return Math.max(10, Math.round(distance / 100 + 20));
    }

    /**
     * Calculate distance between two geographic points using Haversine formula
     */
    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    /**
     * Map cloud region to Electricity Maps zone code
     */
    private mapRegionToZoneCode(region: CloudRegion): string {
        // Map cloud provider regions to Electricity Maps zone codes
        const regionMappings: Record<string, string> = {
            'us-east-1': 'US-MIDA', // Virginia -> Mid-Atlantic
            'us-west-2': 'US-NW', // Oregon -> Northwest
            'eu-west-1': 'IE', // Ireland
            'eu-central-1': 'DE', // Germany
            'ap-southeast-1': 'SG', // Singapore
            'ap-northeast-1': 'JP-TK', // Tokyo
            // Add more mappings as needed
        };

        return regionMappings[region.regionCode] || region.location.country;
    }

    /**
     * Calculate renewable percentage from power breakdown data
     */
    private calculateRenewablePercentage(powerBreakdown: any): number {
        if (!powerBreakdown) return 0;

        const renewableSources = ['solar', 'wind', 'hydro', 'geothermal', 'biomass'];
        let totalRenewable = 0;
        let totalPower = 0;

        for (const [source, value] of Object.entries(powerBreakdown)) {
            if (typeof value === 'number' && value > 0) {
                totalPower += value;
                if (renewableSources.includes(source.toLowerCase())) {
                    totalRenewable += value;
                }
            }
        }

        return totalPower > 0 ? (totalRenewable / totalPower) * 100 : 0;
    }

    /**
     * Generate mock carbon data when API is unavailable
     */
    private getMockCarbonData(region: CloudRegion): CarbonMetrics {
        // Mock data based on typical regional characteristics
        const mockData: Record<string, { intensity: number; renewable: number }> = {
            'US': { intensity: 400, renewable: 20 },
            'DE': { intensity: 350, renewable: 45 },
            'IE': { intensity: 300, renewable: 35 },
            'SG': { intensity: 500, renewable: 5 },
            'JP': { intensity: 450, renewable: 18 },
        };

        const zoneCode = this.mapRegionToZoneCode(region);
        const data = mockData[zoneCode] || { intensity: 400, renewable: 25 };

        return {
            carbonIntensity: data.intensity,
            renewablePercentage: data.renewable,
            dataSource: 'Mock Data',
            lastUpdated: new Date()
        };
    }

    /**
     * Calculate mock costs based on region and provider
     */
    private calculateMockCosts(region: CloudRegion): { compute: number; storage: number; network: number } {
        // Mock pricing based on typical cloud provider costs
        const baseCosts = {
            compute: 0.10, // USD per hour
            storage: 0.023, // USD per GB per month
            network: 0.09 // USD per GB
        };

        // Apply regional multipliers
        const regionalMultipliers: Record<string, number> = {
            'us-east-1': 1.0,
            'us-west-2': 1.1,
            'eu-west-1': 1.2,
            'eu-central-1': 1.15,
            'ap-southeast-1': 1.3,
            'ap-northeast-1': 1.25,
        };

        const multiplier = regionalMultipliers[region.regionCode] || 1.0;

        return {
            compute: baseCosts.compute * multiplier,
            storage: baseCosts.storage * multiplier,
            network: baseCosts.network * multiplier
        };
    }
}