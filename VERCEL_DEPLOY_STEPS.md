# 🚀 Deploy to Vercel - Step by Step

The Referee is ready to go live on Vercel! Follow these simple steps.

---

## **Step 1: Prepare Your Repository**

Make sure everything is committed to Git:

```bash
# Check git status
git status

# Add all files
git add .

# Commit
git commit -m "Region Arbitrator ready for Vercel deployment"

# Push to GitHub (or your Git provider)
git push origin main
```

**Important**: Your repository must be on GitHub, GitLab, or Bitbucket for Vercel to access it.

---

## **Step 2: Create Vercel Account**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (or your Git provider)
4. Authorize Vercel to access your repositories
5. You're logged in! ✅

---

## **Step 3: Import Your Project**

1. Click **"Add New..."** → **"Project"**
2. Click **"Import Git Repository"**
3. Find your repository in the list
4. Click **"Import"**

---

## **Step 4: Configure Project Settings**

Vercel will show you the project configuration page:

### **Framework Preset**
- Should auto-detect: **Next.js** ✅

### **Root Directory**
- Change from `.` to **`dashboard`**
- This tells Vercel where the Next.js app is

### **Build Command**
- Should be: `npm run build` ✅
- (Vercel auto-detects this)

### **Output Directory**
- Should be: `.next` ✅
- (Vercel auto-detects this)

### **Install Command**
- Should be: `npm install` ✅

---

## **Step 5: Environment Variables**

1. Scroll down to **"Environment Variables"**
2. Add these variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_ENABLE_REAL_API` | `true` |
| `NEXT_PUBLIC_ENABLE_DEBUG_LOGGING` | `false` |
| `NEXT_PUBLIC_DEFAULT_CARBON_WEIGHT` | `0.4` |
| `NEXT_PUBLIC_DEFAULT_LATENCY_WEIGHT` | `0.4` |
| `NEXT_PUBLIC_DEFAULT_COST_WEIGHT` | `0.2` |

**How to add them**:
1. Click **"Add New"**
2. Enter the key name
3. Enter the value
4. Click **"Save"**
5. Repeat for each variable

---

## **Step 6: Deploy!**

1. Click **"Deploy"** button at the bottom
2. Vercel will:
   - Clone your repository
   - Install dependencies
   - Build the Next.js app
   - Deploy to their global CDN
3. Wait for the build to complete (usually 2-3 minutes)

---

## **Step 7: Your Live Dashboard! 🎉**

Once deployment completes:

1. You'll see a **"Congratulations!"** message
2. Click the **preview URL** (looks like `https://region-arbitrator-xyz.vercel.app`)
3. Your dashboard is LIVE! 🚀

---

## **Step 8: Share Your Link**

Your dashboard is now accessible to anyone:

```
https://your-project-name.vercel.app
```

Share this link with:
- Friends
- Colleagues
- Team members
- Anyone interested in cloud region analysis!

---

## **Step 9: Custom Domain (Optional)**

Want a custom domain like `region-arbitrator.com`?

1. Go to your Vercel project settings
2. Click **"Domains"**
3. Add your domain
4. Follow DNS configuration instructions
5. Done! Your custom domain is live

---

## **Automatic Deployments**

Great news! Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update dashboard"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Builds your app
# 3. Deploys to production
# 4. Your changes are live!
```

---

## **Monitoring Your Deployment**

### **View Deployment Status**
1. Go to your Vercel dashboard
2. Click your project
3. See all deployments and their status

### **View Logs**
1. Click on a deployment
2. Click **"Logs"** tab
3. See build and runtime logs

### **View Analytics**
1. Click **"Analytics"** tab
2. See traffic, performance, and errors

---

## **Troubleshooting**

### **Build Failed?**

Check the build logs:
1. Click the failed deployment
2. Click **"Logs"** tab
3. Look for error messages
4. Common issues:
   - Missing dependencies: Run `npm install` locally
   - TypeScript errors: Run `npm run type-check` locally
   - Environment variables: Make sure they're set in Vercel

### **Dashboard Not Loading?**

1. Check browser console for errors (F12)
2. Check Vercel logs for runtime errors
3. Make sure environment variables are set
4. Try a hard refresh (Ctrl+Shift+R)

### **Slow Performance?**

1. Vercel uses global CDN (should be fast)
2. Check Vercel Analytics for bottlenecks
3. Enable caching in Vercel settings

---

## **What's Deployed?**

Your Vercel deployment includes:

✅ **Frontend Dashboard**
- Interactive world map
- Referee verdict cards
- Charts and analysis
- Weight adjustment panel
- Leaderboard

✅ **Backend Engine** (embedded)
- Region evaluation logic
- Scoring engine
- Data collection
- Verdict generation

✅ **API Endpoints**
- `/api/health` - Health check
- Region evaluation endpoints

---

## **Next Steps After Deployment**

1. **Test the dashboard**:
   - Click on regions
   - Adjust weights
   - Check verdicts update
   - View charts

2. **Share with others**:
   - Send the Vercel URL
   - They can use it immediately
   - No installation needed

3. **Collect feedback**:
   - Ask users what they think
   - Note any issues
   - Plan improvements

4. **Monitor performance**:
   - Check Vercel analytics
   - Monitor error rates
   - Optimize if needed

---

## **Vercel Dashboard Features**

Once deployed, you get access to:

- **Deployments**: See all versions deployed
- **Analytics**: Traffic, performance, errors
- **Logs**: Build and runtime logs
- **Settings**: Configure your project
- **Domains**: Add custom domains
- **Environment**: Manage variables
- **Integrations**: Connect other services

---

## **Cost**

Vercel pricing:
- **Free tier**: Perfect for this project
  - Unlimited deployments
  - Unlimited bandwidth
  - Global CDN
  - Custom domains
  - No credit card needed

- **Pro tier**: $20/month (if you need more)
  - Priority support
  - Advanced analytics
  - Team collaboration

---

## **Support**

If you get stuck:

1. **Check Vercel docs**: https://vercel.com/docs
2. **Check build logs**: Click deployment → Logs
3. **Check browser console**: F12 → Console tab
4. **Restart deployment**: Click "Redeploy" button

---

## **You're All Set! 🏟️**

Your Region Arbitrator dashboard is now live on Vercel!

**Your deployment URL**: `https://your-project-name.vercel.app`

**Share it with the world and let the Referee help others make better cloud region decisions!**

---

## **Quick Reference**

```bash
# Local development
npm run full:dev

# Build locally
npm run full:build

# Deploy to Vercel
# (Just push to GitHub - Vercel does it automatically!)
git push origin main
```

**The Referee is ready to serve! 🏟️⚽**
