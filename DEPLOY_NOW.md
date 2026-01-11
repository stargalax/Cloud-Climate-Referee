# 🚀 Quick Deployment Guide - Region Arbitrator

The Referee is ready to go live! Here are the fastest ways to deploy:

---

## **Option 1: Vercel (Easiest - 5 minutes)**

Vercel is the official Next.js hosting platform. Perfect for quick deployment.

### Steps:

1. **Push to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Region Arbitrator ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   ```bash
   npm i -g vercel
   cd dashboard
   vercel
   ```

3. **Follow the prompts**:
   - Link to your GitHub repository
   - Select project root: `dashboard`
   - Accept default build settings
   - Deploy!

4. **Your dashboard is live!** 🎉
   - Vercel will give you a URL like: `https://region-arbitrator.vercel.app`
   - Share this link with others

### Environment Variables in Vercel:
- Go to Project Settings → Environment Variables
- Add:
  ```
  NEXT_PUBLIC_ENABLE_REAL_API=true
  NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=false
  ```

---

## **Option 2: Railway (Easy - 10 minutes)**

Railway is a modern deployment platform with free tier.

### Steps:

1. **Connect GitHub**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository

2. **Configure**:
   - Select `dashboard` as the root directory
   - Add environment variables (same as above)
   - Railway auto-detects Next.js

3. **Deploy**:
   - Click "Deploy"
   - Railway builds and deploys automatically
   - Get your live URL in ~2 minutes

---

## **Option 3: Netlify (Easy - 10 minutes)**

Netlify is great for static/hybrid sites.

### Steps:

1. **Build locally first**:
   ```bash
   cd dashboard
   npm run build
   ```

2. **Deploy to Netlify**:
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod --dir=.next
   ```

3. **Or use Netlify UI**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Deploy!

---

## **Option 4: Docker + Any Cloud (Medium - 15 minutes)**

Deploy to AWS, Google Cloud, Azure, DigitalOcean, etc.

### Steps:

1. **Create Dockerfile** (already provided in DEPLOYMENT.md):
   ```bash
   # Copy the Dockerfile from DEPLOYMENT.md to dashboard/
   ```

2. **Build Docker image**:
   ```bash
   cd dashboard
   docker build -t region-arbitrator .
   ```

3. **Push to Docker Hub**:
   ```bash
   docker tag region-arbitrator:latest yourusername/region-arbitrator:latest
   docker push yourusername/region-arbitrator:latest
   ```

4. **Deploy to your cloud provider**:
   - **AWS**: Use ECS or App Runner
   - **Google Cloud**: Use Cloud Run
   - **Azure**: Use Container Instances
   - **DigitalOcean**: Use App Platform
   - **Heroku**: Use Container Registry

---

## **Option 5: Traditional Node.js Server (Medium - 20 minutes)**

Deploy to any Linux server with Node.js.

### Steps:

1. **Build the application**:
   ```bash
   cd dashboard
   npm run build:production
   ```

2. **Upload to your server**:
   ```bash
   scp -r .next package.json package-lock.json user@your-server:/app/
   ```

3. **On your server**:
   ```bash
   cd /app
   npm install --production
   npm run start:production
   ```

4. **Set up reverse proxy** (nginx):
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

5. **Use PM2 to keep it running**:
   ```bash
   npm i -g pm2
   pm2 start "npm run start:production" --name "region-arbitrator"
   pm2 startup
   pm2 save
   ```

---

## **My Recommendation: Vercel (Fastest)**

**Why Vercel?**
- ✅ Optimized for Next.js
- ✅ Free tier available
- ✅ Automatic deployments on git push
- ✅ Global CDN (fast for everyone)
- ✅ Built-in analytics
- ✅ One-click rollbacks
- ✅ Custom domains

**Deploy in 5 minutes**:
```bash
npm i -g vercel
cd dashboard
vercel
# Follow prompts and you're done!
```

---

## **After Deployment**

### 1. **Test Your Deployment**:
```bash
# Visit your deployed URL
# Click on regions to see verdicts
# Try adjusting weights in the Priority Panel
# Check that all features work
```

### 2. **Share Your Link**:
- Send the URL to friends/colleagues
- They can view the dashboard without installing anything
- They can interact with the Referee in real-time

### 3. **Monitor Performance**:
- Check deployment dashboard for errors
- Monitor response times
- Set up alerts for failures

### 4. **Custom Domain** (Optional):
- Point your domain to the deployment
- Most platforms support custom domains
- Usually takes 5-10 minutes to set up

---

## **Troubleshooting**

### Build Fails?
```bash
# Clear cache and rebuild
cd dashboard
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working?
- Make sure they're prefixed with `NEXT_PUBLIC_` for client-side
- Redeploy after adding variables
- Check deployment logs for errors

### Slow Performance?
- Enable caching in deployment settings
- Use a CDN (most platforms do this automatically)
- Check for large bundle sizes: `npm run build:analyze`

### Region Data Not Loading?
- Check that `NEXT_PUBLIC_ENABLE_REAL_API=true`
- Verify backend is running (if using local backend)
- Check browser console for errors

---

## **Environment Variables Needed**

Copy to your deployment platform:

```
NEXT_PUBLIC_ENABLE_REAL_API=true
NEXT_PUBLIC_ENABLE_DEBUG_LOGGING=false
NEXT_PUBLIC_DEFAULT_CARBON_WEIGHT=0.4
NEXT_PUBLIC_DEFAULT_LATENCY_WEIGHT=0.4
NEXT_PUBLIC_DEFAULT_COST_WEIGHT=0.2
```

---

## **Live Demo Features**

Once deployed, users can:

✅ **View the World Map** - See all AWS regions with verdict colors
✅ **Click Regions** - Get instant Referee verdicts
✅ **See Analysis** - Carbon, Latency, Cost breakdown
✅ **Adjust Weights** - Change priorities and see verdicts update
✅ **View Charts** - Radar chart and 24-hour forecast
✅ **Check Leaderboard** - Top 3 regions by score
✅ **Share Results** - Copy shareable links
✅ **Keyboard Navigation** - Arrow keys to navigate regions

---

## **Next Steps**

1. **Choose your deployment option** (I recommend Vercel)
2. **Deploy in 5-20 minutes**
3. **Share the link with others**
4. **Collect feedback**
5. **Iterate and improve**

---

## **Questions?**

- Check `DEPLOYMENT.md` for detailed deployment options
- Check `INTEGRATION.md` for technical details
- Check `ARCHITECTURE.md` for system overview

**The Referee is ready to serve! 🏟️**

Deploy now and let others experience the power of informed cloud region decisions!
