# Region Arbitrator Dashboard - Deployment Guide

This guide covers deployment options for the Region Arbitrator Dashboard, which integrates with the RegionArbitrator TypeScript backend.

## 🏗️ Architecture Overview

The dashboard is a Next.js application that directly imports and uses the RegionArbitrator backend:

```
┌─────────────────────┐    ┌──────────────────────┐
│   Dashboard (UI)    │    │  Backend (Engine)    │
│                     │    │                      │
│  • Next.js App      │◄──►│  • RegionArbitrator  │
│  • React Components │    │  • Data Collectors   │
│  • Framer Motion    │    │  • Analysis Modules  │
│  • Tailwind CSS     │    │  • Scoring Engine    │
└─────────────────────┘    └──────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- TypeScript 5+
- Environment variables configured

### Development Setup

1. **Install dependencies:**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install dashboard dependencies
   cd dashboard
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Copy example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the dashboard:**
   - Open http://localhost:3000
   - The Referee will begin evaluating regions automatically

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides seamless Next.js deployment with automatic builds and global CDN.

1. **Connect repository:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy from dashboard directory
   cd dashboard
   vercel
   ```

2. **Configure environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_ENABLE_REAL_API=true`
   - `NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=false`
   - Add other production variables as needed

3. **Build settings:**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Option 2: Docker Deployment

Deploy using Docker for containerized environments.

1. **Create Dockerfile:**
   ```dockerfile
   # dashboard/Dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   COPY ../package*.json ../
   RUN npm ci --only=production
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   COPY ../ ../
   
   ENV NEXT_TELEMETRY_DISABLED 1
   RUN npm run build
   
   # Production image
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **Build and run:**
   ```bash
   # Build image
   docker build -t region-arbitrator-dashboard .
   
   # Run container
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_ENABLE_REAL_API=true \
     region-arbitrator-dashboard
   ```

### Option 3: Static Export

Generate a static site for hosting on CDNs or static hosting services.

1. **Configure for static export:**
   ```javascript
   // next.config.js
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   }
   ```

2. **Build static site:**
   ```bash
   npm run build
   ```

3. **Deploy to static hosting:**
   - Upload `out/` directory to your hosting service
   - Configure your web server to serve `index.html` for all routes

### Option 4: Node.js Server

Deploy to any Node.js hosting environment.

1. **Build the application:**
   ```bash
   npm run build:production
   ```

2. **Start production server:**
   ```bash
   npm run start:production
   ```

3. **Configure reverse proxy (nginx example):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_REAL_API=true

# Referee Configuration
NEXT_PUBLIC_DEFAULT_CARBON_WEIGHT=0.4
NEXT_PUBLIC_DEFAULT_LATENCY_WEIGHT=0.4
NEXT_PUBLIC_DEFAULT_COST_WEIGHT=0.2
```

### Optional Environment Variables

```bash
# Performance Settings
NEXT_PUBLIC_REGION_EVALUATION_TIMEOUT=15000
NEXT_PUBLIC_BATCH_EVALUATION_TIMEOUT=30000
NEXT_PUBLIC_CACHE_TTL=300000

# UI Settings
NEXT_PUBLIC_ENABLE_ANIMATIONS=true
NEXT_PUBLIC_ENABLE_SOUND_EFFECTS=false
NEXT_PUBLIC_THEME_MODE=dark

# Development Settings
NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=false
NEXT_PUBLIC_LOG_LEVEL=info
```

## 🔧 Build Optimization

### Production Build

```bash
# Clean previous builds
npm run clean

# Type check
npm run type-check

# Build for production
npm run build:production

# Analyze bundle size
npm run build:analyze
```

### Performance Optimizations

1. **Enable compression:**
   ```javascript
   // next.config.js
   const nextConfig = {
     compress: true,
     poweredByHeader: false,
   }
   ```

2. **Configure caching:**
   ```javascript
   // next.config.js
   const nextConfig = {
     async headers() {
       return [
         {
           source: '/_next/static/(.*)',
           headers: [
             {
               key: 'Cache-Control',
               value: 'public, max-age=31536000, immutable',
             },
           ],
         },
       ]
     },
   }
   ```

## 🔍 Monitoring and Debugging

### Health Check Endpoint

The dashboard includes a built-in health check:

```bash
# Check dashboard health
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-01-11T...",
  "services": {
    "regionArbitrator": "healthy",
    "dataCollector": "healthy"
  }
}
```

### Debug Mode

Enable debug logging in development:

```bash
NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=true npm run dev
```

### Performance Monitoring

Monitor the Referee's performance:

```bash
# Enable performance monitoring
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true

# Check browser console for performance metrics
# Look for "🏟️ Referee Performance" logs
```

## 🚨 Troubleshooting

### Common Issues

1. **Backend Integration Errors:**
   ```bash
   # Ensure backend dependencies are installed
   cd .. && npm install
   
   # Check TypeScript compilation
   npm run build
   ```

2. **Environment Variable Issues:**
   ```bash
   # Verify environment variables are loaded
   console.log(process.env.NEXT_PUBLIC_ENABLE_REAL_API)
   ```

3. **Build Failures:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Commands

```bash
# Check build output
npm run build 2>&1 | tee build.log

# Analyze bundle
npm run build:analyze

# Type check without building
npm run type-check
```

## 📊 Performance Benchmarks

Expected performance metrics:

- **Initial Load:** < 2 seconds
- **Region Evaluation:** < 5 seconds
- **Multi-Region Batch:** < 15 seconds
- **Lighthouse Score:** > 90

## 🔐 Security Considerations

1. **Environment Variables:**
   - Never commit `.env.local` to version control
   - Use `NEXT_PUBLIC_` prefix only for client-safe variables
   - Rotate API keys regularly

2. **Content Security Policy:**
   ```javascript
   // next.config.js
   const nextConfig = {
     async headers() {
       return [
         {
           source: '/(.*)',
           headers: [
             {
               key: 'Content-Security-Policy',
               value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
             }
           ]
         }
       ]
     }
   }
   ```

3. **API Rate Limiting:**
   - Configure appropriate timeouts
   - Implement client-side request throttling
   - Monitor API usage patterns

## 📈 Scaling Considerations

1. **Horizontal Scaling:**
   - Deploy multiple instances behind a load balancer
   - Use Redis for session storage if needed
   - Configure sticky sessions for WebSocket connections

2. **Caching Strategy:**
   - Enable Next.js ISR for static content
   - Cache region evaluation results
   - Use CDN for static assets

3. **Database Considerations:**
   - The current implementation is stateless
   - Consider adding persistent storage for user preferences
   - Implement audit logging for compliance

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance:**
   - Set up application monitoring
   - Configure error tracking
   - Monitor API response times

2. **User Feedback:**
   - Collect user feedback on Referee decisions
   - Monitor usage patterns
   - Iterate on UI/UX improvements

3. **Feature Enhancements:**
   - Add custom region configurations
   - Implement user preference persistence
   - Add advanced filtering and sorting options

---

**The Referee is ready for deployment! 🏟️**

For additional support, check the main README.md or create an issue in the repository.