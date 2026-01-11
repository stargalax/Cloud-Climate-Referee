// AWS region coordinates and display information
export interface AWSRegionData {
    regionCode: string
    displayName: string
    coordinates: [number, number] // [longitude, latitude]
    country: string
    city: string
}

export const AWS_REGIONS: AWSRegionData[] = [
    {
        regionCode: 'us-east-1',
        displayName: 'N. Virginia',
        coordinates: [-77.4, 39.0],
        country: 'United States',
        city: 'N. Virginia'
    },
    {
        regionCode: 'us-west-2',
        displayName: 'Oregon',
        coordinates: [-120.5, 44.0],
        country: 'United States',
        city: 'Oregon'
    },
    {
        regionCode: 'eu-west-1',
        displayName: 'Ireland',
        coordinates: [-8.0, 53.0],
        country: 'Ireland',
        city: 'Dublin'
    },
    {
        regionCode: 'eu-central-1',
        displayName: 'Frankfurt',
        coordinates: [8.7, 50.1],
        country: 'Germany',
        city: 'Frankfurt'
    },
    {
        regionCode: 'ap-northeast-1',
        displayName: 'Tokyo',
        coordinates: [139.7, 35.7],
        country: 'Japan',
        city: 'Tokyo'
    },
    {
        regionCode: 'ap-southeast-1',
        displayName: 'Singapore',
        coordinates: [103.8, 1.3],
        country: 'Singapore',
        city: 'Singapore'
    },
    {
        regionCode: 'ca-central-1',
        displayName: 'Canada Central',
        coordinates: [-73.6, 45.5],
        country: 'Canada',
        city: 'Montreal'
    },
    {
        regionCode: 'eu-north-1',
        displayName: 'Stockholm',
        coordinates: [18.1, 59.3],
        country: 'Sweden',
        city: 'Stockholm'
    },
    {
        regionCode: 'sa-east-1',
        displayName: 'São Paulo',
        coordinates: [-46.6, -23.5],
        country: 'Brazil',
        city: 'São Paulo'
    },
    {
        regionCode: 'ap-south-1',
        displayName: 'Mumbai',
        coordinates: [72.8, 19.1],
        country: 'India',
        city: 'Mumbai'
    }
]

export const getRegionByCode = (regionCode: string): AWSRegionData | undefined => {
    return AWS_REGIONS.find(region => region.regionCode === regionCode)
}