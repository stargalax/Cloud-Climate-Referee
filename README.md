# Region Arbitrator - Architecture & Documentation

## System Overview

The Region Arbitrator is a cloud region evaluation system that uses a "Referee" metaphor to provide verdicts on AWS, Azure, and GCP regions based on three key metrics: **Carbon Intensity**, **Latency**, and **Cost**. The system delivers verdicts in the form of colored cards (🟢 Play On, 🟡 Yellow Card, 🔴 Red Card, 🔵 Blue Card) to guide infrastructure decisions.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        REGION ARBITRATOR SYSTEM                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND LAYER (Next.js)                        │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  Global Pitch   │  │  Physical Card   │  │  Priority Panel      │   │
│  │  (World Map)    │  │  (Verdict Card)  │  │  (Weight Sliders)    │   │
│  └─────────────────┘  └──────────────────┘  └──────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Analysis Panel (Carbon/Latency/Cost Breakdown)                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  VAR Analysis (Radar Chart + 24h Forecast)                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Leaderboard (Top 3 Regions)                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
                        ┌───────────────────────┐
                        │  Dashboard Context    │
                        │  (State Management)   │
                        └───────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                      API SERVICE LAYER (Next.js API)                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  /api/health - Health Check Endpoint                            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Mock Data Service (Development)                                │   │
│  │  - Generates verdicts for all AWS regions                       │   │
│  │  - Simulates real-world scoring                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                    CORE ARBITRATOR ENGINE (TypeScript)                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  CloudRegionArbitrator (Main Orchestrator)                      │    │
│  │  - Coordinates all analysis components                          │    │
│  │  - Manages factor weights (Carbon 40%, Latency 40%, Cost 20%)   │    │
│  │  - Generates verdicts with reasoning                            │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ Data Collector   │  │ Carbon Analyzer  │  │ Latency Analyzer │      │
│  │ - Fetches metrics│  │ - Intensity      │  │ - Static Map     │      │
│  │ - Validates data │  │ - Renewable %    │  │ - Ping validation│      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │ Cost Analyzer    │  │ Scoring Engine   │  │ Verdict Generator│      │
│  │ - Multi-dim cost │  │ - Normalization  │  │ - Reasoning      │      │
│  │ - Market index   │  │ - Red Card Rule  │  │ - Suggestions    │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│                         DATA SOURCES & APIS                              │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Electricity Maps API (Carbon Intensity)                        │   │
│  │  - Real-time carbon intensity data                              │   │
│  │  - Renewable energy percentages                                 │   │
│  │  - Regional grid composition                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Static Latency Map (Baseline Performance)                      │   │
│  │  - Pre-computed inter-region latencies                          │   │
│  │  - Geographic distance factors                                  │   │
│  │  - Consistent global evaluation                                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
- **Next.js 15.1.1** - React framework with server-side rendering
- **React 18** - UI component library
- **Framer Motion 11.11.17** - Animation library for smooth transitions
- **Recharts 2.13.3** - Chart library for data visualization
- **React Simple Maps 3.0.0** - Interactive world map component
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **TypeScript 5** - Type-safe JavaScript

### Backend
- **TypeScript 5.3.3** - Type-safe language
- **Node.js 18+** - Runtime environment
- **Jest 29.7.0** - Testing framework
- **fast-check 3.15.1** - Property-based testing library
- **ts-node 10.9.2** - TypeScript execution for Node.js

### Build & Deployment
- **npm 8.0.0+** - Package manager
- **Concurrently 9.2.1** - Run multiple processes
- **ESLint 8** - Code linting
- **PostCSS 8.4.49** - CSS processing

---

## Verdict Metrics & Scoring Logic

### 1. Carbon Intensity Score (40% weight)

**Metric**: gCO2/kWh (grams of CO2 per kilowatt-hour)

**Normalization**:
- 0g CO2/kWh = 100 points (best)
- 500g CO2/kWh = 0 points (worst)
- Linear interpolation between

**Factors**:
- Carbon intensity from grid composition
- Renewable energy percentage (bonus/penalty)
- Data source trustworthiness
- Data freshness (penalty if >2 hours old)

**Categories**:
- 🟢 **Very Clean**: ≤100g CO2/kWh + ≥80% renewable
- 🟢 **Clean**: ≤200g CO2/kWh + ≥50% renewable
- 🟡 **Moderate**: ≤350g CO2/kWh
- 🔴 **High Carbon**: >350g CO2/kWh

### 2. Latency Score (40% weight)

**Metric**: Milliseconds (ms) round-trip time

**Normalization**:
- 0ms = 100 points (best)
- 200ms = 0 points (worst)
- Linear interpolation between

**Approach**:
- Uses **static baseline map** for consistent global evaluation
- Real ping data validates confidence (not used for scoring)
- Ensures fair evaluation regardless of user location

**Categories**:
- 🟢 **Excellent**: ≤50ms
- 🟢 **Good**: ≤100ms
- 🟡 **Acceptable**: ≤150ms
- 🔴 **Poor**: >150ms

### 3. Cost Score (20% weight)

**Metric**: USD per hour (compute), per GB (storage/network)

**Normalization**:
- Uses market baseline indexing
- Baseline compute: $0.10/hour
- Baseline storage: $0.023/GB/month
- Baseline network: $0.09/GB
- Logarithmic scaling: 1x baseline = 50 points

**Dimensions**:
- Compute cost (50% weight)
- Storage cost (30% weight)
- Network cost (20% weight)

**Categories**:
- 🟢 **Very Affordable**: ≤0.7x baseline
- 🟢 **Affordable**: ≤0.9x baseline
- 🟡 **Moderate**: ≤1.2x baseline
- 🔴 **Expensive**: >1.2x baseline

### 4. Composite Score Calculation

```
Composite Score = (Carbon × 0.4) + (Latency × 0.4) + (Cost × 0.2)
```

**Red Card Rule**: Any individual factor < 30 points = Automatic Red Card

### 5. Verdict Types

| Verdict | Condition | Emoji |
|---------|-----------|-------|
| **Play On** | Score ≥70 & all factors ≥30 | 🟢 |
| **Yellow Card** | Score 40-69 & all factors ≥30 | 🟡 |
| **Red Card** | Score <40 OR any factor <30 | 🔴 |
| **Blue Card** | Data collection error | 🔵 |

---

## APIs & Data Sources

### 1. Electricity Maps API
**Purpose**: Real-time carbon intensity data

**Endpoint**: `https://api.electricitymap.org/v3/carbon-intensity/latest`

**Data Provided**:
- Carbon intensity (gCO2/kWh)
- Renewable energy percentage
- Data freshness timestamp
- Grid composition breakdown

**Authentication**: API key required

### 2. Cloud Provider Pricing APIs

#### AWS Pricing API
- Compute (EC2) pricing
- Storage (S3) pricing
- Network transfer costs

#### Azure Pricing API
- Virtual Machine pricing
- Storage pricing
- Bandwidth costs

#### GCP Pricing API
- Compute Engine pricing
- Cloud Storage pricing
- Network egress costs

### 3. Static Latency Map
**Purpose**: Baseline inter-region latency

**Data Structure**:
```typescript
{
  regionCode: {
    baselineLatency: number,    // ms
    p95Latency: number,         // ms
    description: string
  }
}
```

**Coverage**: 10 major cloud regions across AWS, Azure, GCP

---

## Testing Strategy

### 1. Unit Tests
**Framework**: Jest

**Coverage Areas**:
- Individual analyzer functions
- Score normalization logic
- Verdict generation rules
- Data validation

**Example**:
```bash
npm test -- src/analyzers/CarbonAnalyzer.test.ts
```

### 2. Property-Based Tests
**Framework**: fast-check

**Properties Tested**:
- **Invariants**: Scores always 0-100
- **Round-trip**: Parse → Format → Parse = Identity
- **Idempotence**: Applying rules twice = applying once
- **Metamorphic**: Relationships between factors hold

**Example**:
```typescript
// Property: Carbon score normalization is monotonic
property(
  fc.integer({ min: 0, max: 500 }),
  (intensity) => {
    const score1 = analyzer.normalizeCarbonScore(intensity);
    const score2 = analyzer.normalizeCarbonScore(intensity + 10);
    return score1 >= score2; // Higher intensity = lower score
  }
)
```

### 3. Integration Tests
**Scope**: Full evaluation pipeline

**Test Cases**:
- Multi-region evaluation
- Weight configuration changes
- Verdict consistency
- Error handling

### 4. Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test:coverage

# Property-based tests
npm test -- --testNamePattern="property"
```

---

## Component Architecture

### Frontend Components

#### GlobalPitch
- Interactive world map
- Region selection
- Verdict visualization
- Click-to-select regions

#### PhysicalCard
- High-end sports card design
- Centered verdict icon
- Overall score display
- Region name and code
- Animated entrance

#### AnalysisPanel
- 3-column layout
- Referee's analysis text
- Substitution recommendations
- Mini-gauges for metrics

#### Leaderboard
- Top 3 regions by score
- Medal rankings (🥇🥈🥉)
- Interactive selection
- Score display

#### RefereePriorityPanel
- Weight sliders (Carbon/Latency/Cost)
- Apply rules button
- Real-time recalculation

#### VARAnalysis
- Radar chart (trade-off analysis)
- 24-hour carbon forecast
- Live ticker
- Current intensity display

### Backend Components

#### CloudRegionArbitrator
- Main orchestrator
- Coordinates all analyzers
- Manages weights
- Generates verdicts

#### Analyzers
- **CarbonAnalyzer**: Carbon intensity + renewable %
- **LatencyAnalyzer**: Static baseline + ping validation
- **CostAnalyzer**: Multi-dimensional cost analysis

#### ScoringEngine
- Normalization logic
- Weight application
- Red Card rule enforcement
- Confidence calculation

#### VerdictGenerator
- Verdict determination
- Reasoning generation
- Green suggestions
- Alternative recommendations

---

## Data Flow

```
1. User selects region
   ↓
2. Dashboard Context triggers evaluation
   ↓
3. API Service fetches data:
   - Carbon intensity (Electricity Maps)
   - Latency (Static map)
   - Cost (Provider APIs)
   ↓
4. Arbitrator Engine processes:
   - CarbonAnalyzer → Carbon Score
   - LatencyAnalyzer → Latency Score
   - CostAnalyzer → Cost Score
   ↓
5. ScoringEngine combines:
   - Applies weights
   - Checks Red Card rule
   - Calculates confidence
   ↓
6. VerdictGenerator creates:
   - Verdict (Play On/Yellow/Red/Blue)
   - Reasoning
   - Suggestions
   ↓
7. Dashboard displays:
   - Physical Card
   - Analysis Panel
   - Charts & Leaderboard
```

---

## Configuration

### Factor Weights
Default: Carbon 40%, Latency 40%, Cost 20%

Configurable via UI sliders or programmatically:
```typescript
arbitrator.configureWeights({
  carbon: 0.5,
  latency: 0.3,
  cost: 0.2
});
```

### Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:3000
ELECTRICITY_MAPS_API_KEY=your_key_here
AWS_REGION=us-east-1
```

---

## Performance Considerations

- **Caching**: Verdicts cached for 5 minutes
- **Parallel Evaluation**: Multi-region evaluation uses Promise.all()
- **Lazy Loading**: Components load on demand
- **Memoization**: React.memo for expensive components
- **Code Splitting**: Next.js automatic route-based splitting

---

## Error Handling

### Blue Card (Technical Timeout)
Triggered when:
- Data collection fails
- API unavailable
- Invalid region code
- Network timeout

### Graceful Degradation
- Falls back to cached data
- Shows error message
- Suggests retry action
- Maintains UI responsiveness

---

## Future Enhancements

1. **Real-time Updates**: WebSocket for live carbon data
2. **Machine Learning**: Predictive carbon intensity
3. **Custom Metrics**: User-defined scoring factors
4. **Historical Analysis**: Trend tracking
5. **Multi-cloud Comparison**: Cross-provider analysis
6. **Automated Recommendations**: ML-based suggestions

---

## References

- [Electricity Maps API](https://api.electricitymap.org)
- [AWS Pricing API](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html)
- [Azure Pricing API](https://learn.microsoft.com/en-us/rest/api/cost-management/)
- [GCP Pricing API](https://cloud.google.com/billing/docs/reference/rest)
- [Next.js Documentation](https://nextjs.org/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)

