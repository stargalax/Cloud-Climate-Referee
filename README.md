# Region Arbitrator

A cloud region evaluation system that provides referee-style verdicts based on latency, carbon intensity, and cost analysis.

## Project Structure

```
src/
├── types/           # Core type definitions
├── data/            # Data collection components
├── analyzers/       # Analysis modules (to be implemented)
├── scoring/         # Scoring engine (to be implemented)
├── verdict/         # Verdict generation (to be implemented)
└── index.ts         # Main entry point

examples/            # Usage examples
tests/               # Test files
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Copy the .env file and add your API keys
cp .env .env.local  # Optional: create a local copy
# Edit .env and replace 'your_api_key_here' with your actual Electricity Maps API key
```

3. Build the project:
```bash
npm run build
```

4. Run tests:
```bash
npm test
```

## Environment Configuration

The system uses environment variables for API configuration:

- `ELECTRICITY_MAPS_API_KEY`: Your Electricity Maps API key for real-time carbon intensity data
  - Sign up at [Electricity Maps](https://www.electricitymap.org/) to get an API key
  - If no key is provided, the system will use mock data

### Testing the Data Collector

You can test the carbon data collection with:

```bash
npx ts-node examples/test-carbon-data.ts
```

This will attempt to fetch real carbon intensity data for Virginia (US-MIDA zone) and fall back to mock data if no API key is configured.

## Current Implementation Status

✅ **Task 1: Project Structure and Data Collection Foundation**
- TypeScript project structure with proper module organization
- Jest testing framework with fast-check for property-based testing
- Core type definitions for CloudRegion, metrics interfaces, and verdict types
- DataCollector interface with Electricity Maps API integration

## Data Collection

The `RegionDataCollector` class provides methods to collect:

- **Latency Data**: Network response times and geographic proximity metrics
- **Carbon Data**: Carbon intensity and renewable energy percentage (via Electricity Maps API)
- **Cost Data**: Multi-dimensional pricing across compute, storage, and network

### Usage Example

```typescript
import { RegionDataCollector, CloudRegion } from './src/index';

const dataCollector = new RegionDataCollector('your-electricity-maps-api-key');

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

// Collect all metrics
const latencyData = await dataCollector.getLatencyData(region);
const carbonData = await dataCollector.getCarbonData(region);
const costData = await dataCollector.getCostData(region);
```

## API Integration

### Electricity Maps API

The system integrates with the Electricity Maps API to fetch real-time carbon intensity data. To use this feature:

1. Sign up for an API key at [Electricity Maps](https://www.electricitymap.org/)
2. Pass the API key to the `RegionDataCollector` constructor
3. The system will automatically fall back to mock data if the API is unavailable

## Testing

The project uses Jest with TypeScript support and includes:

- Unit tests for data collection components
- Property-based testing setup with fast-check (ready for future use)
- Comprehensive test coverage for core functionality

Run tests with:
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## Next Steps

The following components are ready to be implemented in subsequent tasks:

- Latency Analysis Module
- Carbon Intensity Analysis Module  
- Cost Analysis Module
- Scoring Engine
- Verdict Generation
- Multi-region Comparison
- Error Handling and Data Quality Management

## Requirements Validation

This implementation addresses the following requirements:

- **6.1**: Current latency measurements through data collection infrastructure
- **6.2**: Up-to-date environmental data via Electricity Maps API integration
- **6.3**: Current pricing information through cost data collection