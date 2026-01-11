# Implementation Plan: Region Arbitrator

## Overview

This implementation plan breaks down the Region Arbitrator system into discrete coding tasks, starting with data collection infrastructure and building up to the complete evaluation system. The approach prioritizes early validation through testing and incremental integration of components.

## Tasks

- [x] 1. Set up project structure and data collection foundation
  - Create TypeScript project structure with proper module organization
  - Set up testing framework (Jest) with fast-check for property-based testing
  - Create core type definitions for CloudRegion, metrics interfaces, and verdict types
  - Implement DataCollector interface with Electricity Maps API integration using Fetch MCP
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 1.1 Write property test for data collection
  - **Property 13: Data Freshness Validation**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 2. Implement latency analysis module
  - Create LatencyAnalyzer class with geographic distance calculations
  - Implement latency scoring algorithm (0-100 scale) based on response times
  - Add confidence scoring based on measurement quality and recency
  - _Requirements: 1.2_

- [ ]* 2.1 Write property test for latency analysis
  - **Property 2: Latency Analysis Correlation**
  - **Validates: Requirements 1.2**

- [ ]* 2.2 Write unit tests for latency analyzer
  - Test edge cases: zero latency, extreme values, missing data
  - Test geographic distance calculations
  - _Requirements: 1.2_

- [x] 3. Implement carbon intensity analysis module
  - Create CarbonAnalyzer class with renewable energy percentage integration
  - Implement carbon scoring algorithm incorporating both intensity and renewable data
  - Add data source validation and confidence scoring
  - _Requirements: 1.3_

- [ ]* 3.1 Write property test for carbon analysis
  - **Property 3: Carbon Analysis Integration**
  - **Validates: Requirements 1.3**

- [ ]* 3.2 Write unit tests for carbon analyzer
  - Test renewable percentage calculations
  - Test carbon intensity normalization
  - _Requirements: 1.3_

- [x] 4. Implement cost analysis module
  - Create CostAnalyzer class with multi-dimensional pricing evaluation
  - Implement cost scoring algorithm across compute, storage, and network dimensions
  - Add relative cost indexing against market baselines
  - _Requirements: 1.4_

- [ ]* 4.1 Write property test for cost analysis
  - **Property 4: Cost Analysis Comprehensiveness**
  - **Validates: Requirements 1.4**

- [ ]* 4.2 Write unit tests for cost analyzer
  - Test multi-dimensional cost calculations
  - Test relative cost indexing
  - _Requirements: 1.4_

- [x] 5. Checkpoint - Ensure all analysis modules work independently
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement scoring engine and verdict generation
  - Create ScoringEngine class with configurable factor weights
  - Implement CompositeScore calculation with weighted combination
  - Create VerdictGenerator class with score-to-verdict mapping logic
  - Add verdict thresholds: Red Card (<40), Yellow Card (40-70), Play On (>70)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 6.1 Write property test for complete factor analysis
  - **Property 1: Complete Factor Analysis**
  - **Validates: Requirements 1.1**

- [ ]* 6.2 Write property test for verdict format compliance
  - **Property 5: Verdict Format Compliance**
  - **Validates: Requirements 2.1**

- [ ]* 6.3 Write property test for verdict logic consistency
  - **Property 6: Verdict Logic Consistency**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 7. Implement reasoning and suggestion generation
  - Add reasoning generation that references specific factors in decisions
  - Implement green suggestion logic with alternative region prioritization
  - Add fallback to optimization strategies when no better regions exist
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3_

- [ ]* 7.1 Write property test for reasoning completeness
  - **Property 7: Reasoning Completeness**
  - **Validates: Requirements 3.1, 3.2**

- [ ]* 7.2 Write property test for green suggestion presence
  - **Property 8: Green Suggestion Presence**
  - **Validates: Requirements 4.1**

- [ ]* 7.3 Write property test for green alternative prioritization
  - **Property 9: Green Alternative Prioritization**
  - **Validates: Requirements 4.2**

- [ ]* 7.4 Write property test for optimization strategy fallback
  - **Property 10: Optimization Strategy Fallback**
  - **Validates: Requirements 4.3**

- [x] 8. Implement main RegionArbitrator interface
  - Create RegionArbitrator class that orchestrates all components
  - Implement evaluateRegion() method for single region evaluation
  - Implement evaluateMultipleRegions() method for batch processing
  - Add configurable factor weights with validation
  - _Requirements: 5.1, 5.2, 5.3_

- [ ]* 8.1 Write property test for multi-region independence
  - **Property 11: Multi-Region Independence**
  - **Validates: Requirements 5.1, 5.2**

- [ ]* 8.2 Write property test for multi-region output distinction
  - **Property 12: Multi-Region Output Distinction**
  - **Validates: Requirements 5.3**

- [x] 9. Implement error handling and data quality management
  - Update the DataCollector to handle cases where a Zone Key might not return data. If an API call fails or returns a 404, the Referee should issue a 'Blue Card' (Technical Timeout). This indicates that the region is temporarily un-arbitrated due to data unavailability, rather than falling back to potentially misleading mock data."
  - Add comprehensive error handling for network timeouts and API failures
  - Implement confidence scoring and uncertainty indication
  - Add data validation and schema checking for all external data sources
  - _Requirements: 6.4_

- [x] 9.1 Write property test for uncertainty indication

  - **Implement a ConfidenceScore in the CarbonAnalyzer. If the data from the API is more than 2 hours old, decrease the confidence score by 20%. The final verdict should mention: 'Referee Confidence: High/Medium/Low' based on data freshness**

- [ ]* 9.2 Write unit tests for error handling
  - Test network timeout scenarios
  - Test invalid data handling
  - Test confidence scoring edge cases
  - _Requirements: 6.4_

- [x] 10. Integration and output formatting
  -Now, integrate everything. When evaluateMultipleRegions is called, it should:

  Use our region-mapping.json to fetch carbon data for all selected regions in parallel.

  Calculate the scores using our weighted configuration.

  Sort the results so the Greenest region is always at the top, even if it has slightly higher latency.

  Format the final output to look like a 'Referee Match Report'
  - Add timestamp and metadata to all verdicts
  - Create example usage and demonstration scripts
  - _Requirements: All requirements integration_

- [ ]* 10.1 Write integration tests
  - Test end-to-end evaluation flows
  - Test multi-region batch processing
  - Test error propagation through the system
  - _Requirements: All requirements integration_

- [x] 11. Final checkpoint - Ensure complete system functionality
  - Ensure all tests pass, ask the user if questions arise.
  - Verify all requirements are met through comprehensive testing
  - Validate system performance and error handling

- [ ] 12. Initialize React/Next.js dashboard frontend
  - Create dashboard/ directory with Next.js project structure
  - Set up TypeScript configuration and core dependencies
  - Install required packages: framer-motion, react-simple-maps, recharts, tailwindcss
  - Configure Tailwind CSS with custom color palette and glassmorphism utilities
  - _Requirements: All requirements (UI representation)_

- [ ] 12.1 Implement "Global Pitch" map component
  - Create interactive world map using react-simple-maps
  - Plot 10 AWS regions from region-mapping.json as pulsing markers
  - Implement verdict-based color coding (Green/Yellow/Red) for region markers
  - Add "Stadium Spotlight" radial gradient effect for active region selection
  - Include hover states with 1.3x scale animation and smooth tooltips
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 12.2 Create "Referee's Card" verdict panel component
  - Implement Framer Motion card animation (bottom entrance with -2deg rotation)
  - Design verdict header with whistle/card icon and "VERDICT: [LEVEL]" text
  - Add circular progress gauge showing composite score (0-100)
  - Display reasoning text in high-readability format with referee tone
  - Create "Substitution" recommendation box for green alternatives
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2_

- [ ] 12.3 Build "VAR Analysis" charts component
  - Implement radar chart showing Carbon/Latency/Cost trade-offs using recharts
  - Create 24-hour carbon intensity forecast area chart
  - Apply dynamic verdict color theming with 0.2 opacity fills
  - Add animated number ticker for carbon intensity values
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2_

- [ ] 12.4 Integrate RegionArbitrator backend API
  - Create API service layer to connect dashboard to RegionArbitrator engine
  - Implement data fetching for all 10 mapped regions in parallel
  - Add real-time updates and error handling for API failures
  - Ensure proper TypeScript typing for all API responses
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 12.5 Implement dynamic theming and animations
  - Create "Breathe" effect with verdict-based background gradient pulsing
  - Implement smooth region selection transitions with layoutId animations
  - Add glassmorphism styling (backdrop-blur-xl, bg-slate-900/60, border-white/10)
  - Configure responsive design for different screen sizes
  - _Requirements: All requirements (enhanced UX)_

- [ ] 12.6 Add dashboard state management and routing
  - Implement React state management for selected regions and verdicts
  - Add URL routing for shareable region analysis links
  - Create loading states and error boundaries for robust UX
  - Add keyboard navigation and accessibility features
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 13. Dashboard integration and deployment setup
  - Connect dashboard to existing RegionArbitrator TypeScript backend
  - Create build scripts and development server configuration
  - Add environment configuration for API endpoints
  - Create example deployment documentation
  - _Requirements: All requirements integration_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The system starts with data collection infrastructure and builds incrementally
- Electricity Maps API integration provides real-world carbon intensity data
- Fetch MCP enables clean API integration without additional dependencies