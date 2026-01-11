import {
    DataCollector,
    CloudRegion,
    LatencyMetrics,
    CarbonMetrics,
    CostMetrics,
    DataCollectionError
} from '../types/index';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Load region mapping
const regionMappingPath = path.join(__dirname, 'region-mapping.json');
const regionMapping: Record<string, string> = JSON.parse(fs.readFileSync(regionMappingPath, 'utf8'));

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
     * Collect carbon intensity data using Electricity Maps API with forecast endpoint
     * Throws DataCollectionError for API failures that should trigger Blue Card
     */
    async getCarbonData(region: CloudRegion): Promise<CarbonMetrics> {
        try {
            // Map cloud region to Electricity Maps zone code
            const zoneCode = this.mapRegionToZoneCode(region);

            if (!this.electricityMapsApiKey) {
                // Return mock data if no API key provided
                return this.getMockCarbonData(region);
            }

            // Fetch carbon intensity forecast from Electricity Maps
            const response = await fetch(
                `${this.baseElectricityMapsUrl}/carbon-intensity/forecast?zone=${zoneCode}`,
                {
                    headers: {
                        'auth-token': this.electricityMapsApiKey
                    },
                    // Add timeout to prevent hanging requests
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                }
            );

            // Handle specific HTTP errors that should trigger Blue Card
            if (response.status === 404) {
                throw new DataCollectionError(
                    `Zone key '${zoneCode}' not found in Electricity Maps API`,
                    region,
                    'carbon'
                );
            }

            if (response.status === 429) {
                throw new DataCollectionError(
                    `API rate limit exceeded for zone '${zoneCode}'`,
                    region,
                    'carbon'
                );
            }

            if (response.status >= 500) {
                throw new DataCollectionError(
                    `Electricity Maps API server error (${response.status}) for zone '${zoneCode}'`,
                    region,
                    'carbon'
                );
            }

            if (!response.ok) {
                console.warn(`Electricity Maps API error: ${response.status}. Using mock data.`);
                return this.getMockCarbonData(region);
            }

            const data = await response.json() as any;

            // Get the most recent forecast data point
            const latestForecast = data.forecast && data.forecast.length > 0
                ? data.forecast[0]
                : null;

            if (!latestForecast) {
                throw new DataCollectionError(
                    `No forecast data available for zone '${zoneCode}'`,
                    region,
                    'carbon'
                );
            }

            // Fetch renewable percentage from power breakdown
            const renewableResponse = await fetch(
                `${this.baseElectricityMapsUrl}/power-breakdown/latest?zone=${zoneCode}`,
                {
                    headers: {
                        'auth-token': this.electricityMapsApiKey
                    },
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                }
            );

            let renewablePercentage = 0;
            if (renewableResponse.ok) {
                const renewableData = await renewableResponse.json() as any;
                renewablePercentage = this.calculateRenewablePercentage(renewableData.powerConsumptionBreakdown);
            }

            return {
                carbonIntensity: latestForecast.carbonIntensity || 0,
                renewablePercentage,
                dataSource: 'Electricity Maps API (Forecast)',
                lastUpdated: new Date(latestForecast.datetime)
            };

        } catch (error) {
            // Re-throw DataCollectionError for Blue Card scenarios
            if (error instanceof DataCollectionError) {
                throw error;
            }

            // Handle network timeouts and other fetch errors
            if (error instanceof Error) {
                if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
                    throw new DataCollectionError(
                        `Network timeout while fetching carbon data for region '${region.regionCode}'`,
                        region,
                        'carbon',
                        error
                    );
                }

                if (error.message.includes('fetch')) {
                    throw new DataCollectionError(
                        `Network error while fetching carbon data for region '${region.regionCode}': ${error.message}`,
                        region,
                        'carbon',
                        error
                    );
                }
            }

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
     * Map cloud region to Electricity Maps zone code using the mapping file
     */
    private mapRegionToZoneCode(region: CloudRegion): string {
        // First try to get the zone code from our mapping file
        const zoneCode = regionMapping[region.regionCode];
        if (zoneCode) {
            return zoneCode;
        }

        // Fallback to country code if region not found in mapping
        console.warn(`Region ${region.regionCode} not found in mapping, using country code: ${region.location.country}`);
        return region.location.country;
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
        // Mock data based on typical regional characteristics using our zone mapping
        const zoneCode = regionMapping[region.regionCode] || region.location.country;

        const mockData: Record<string, { intensity: number; renewable: number }> = {
            'US-MIDA-PJM': { intensity: 400, renewable: 20 }, // US East
            'US-NW-PACW': { intensity: 250, renewable: 60 },  // US West (hydro-heavy)
            'IE': { intensity: 300, renewable: 35 },          // Ireland
            'DE': { intensity: 350, renewable: 45 },          // Germany
            'JP-ON': { intensity: 450, renewable: 18 },       // Japan
            'SG': { intensity: 500, renewable: 5 },           // Singapore
            'CA-QC': { intensity: 150, renewable: 95 },       // Quebec (hydro)
            'SE-SE3': { intensity: 100, renewable: 85 },      // Sweden (hydro/nuclear)
            'BR-CS': { intensity: 200, renewable: 75 },       // Brazil (hydro)
            'IN-WE': { intensity: 600, renewable: 15 },       // India West
            // Fallback for unknown zones
            'US': { intensity: 400, renewable: 20 },
            'CA': { intensity: 200, renewable: 80 },
            'SE': { intensity: 100, renewable: 85 },
            'BR': { intensity: 200, renewable: 75 },
            'IN': { intensity: 600, renewable: 15 },
            'JP': { intensity: 450, renewable: 18 }
        };

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