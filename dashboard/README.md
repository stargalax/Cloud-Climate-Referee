# Region Arbitrator Dashboard

A Next.js dashboard for the Region Arbitrator system with referee-style verdicts and glassmorphism design.

## Features

- 🗺️ **Global Pitch**: Interactive world map with region markers
- 🟨 **Referee's Card**: Verdict panel with animated cards
- 📊 **VAR Analysis**: Charts and trade-off analysis
- 📺 **Live Ticker**: Real-time region status updates
- 🎨 **Glassmorphism UI**: Modern glass-effect styling
- ⚡ **Framer Motion**: Smooth animations and transitions

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
dashboard/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   │   ├── ui/             # UI components
│   │   ├── map/            # Map components (subtask 12.1)
│   │   ├── verdict/        # Verdict components (subtask 12.2)
│   │   └── charts/         # Chart components (subtask 12.3)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── public/                 # Static assets
└── tailwind.config.ts      # Tailwind CSS configuration
```

## Implementation Status

- ✅ **Task 12**: Basic Next.js setup with TypeScript and Tailwind
- ⏳ **Task 12.1**: Global Pitch map component
- ⏳ **Task 12.2**: Referee's Card verdict panel
- ⏳ **Task 12.3**: VAR Analysis charts
- ⏳ **Task 12.4**: Backend API integration
- ⏳ **Task 12.5**: Dynamic theming and animations
- ⏳ **Task 12.6**: State management and routing

## Design System

### Colors
- **Red Card**: `#DC2626` - Critical issues
- **Yellow Card**: `#F59E0B` - Caution needed
- **Play On**: `#10B981` - Good to go
- **Glass**: Semi-transparent overlays with backdrop blur

### Animations
- **Breathe**: Background gradient pulsing
- **Pulse**: Region marker animations
- **Ticker**: Scrolling news ticker
- **Card Entrance**: Bottom-up with rotation

## Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animation library
- **React Simple Maps**: World map component
- **Recharts**: Chart library

## Development

The dashboard is designed to work with the existing RegionArbitrator TypeScript backend. Mock data is used during development and will be replaced with real API calls in subtask 12.4.