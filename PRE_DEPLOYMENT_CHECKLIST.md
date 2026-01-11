# ✅ Pre-Deployment Checklist

Before deploying to Vercel, make sure everything is ready!

---

## **Local Setup ✅**

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 8+ installed (`npm --version`)
- [ ] Git installed and configured (`git --version`)
- [ ] Repository initialized (`git status` works)

---

## **Code Quality ✅**

- [ ] No TypeScript errors:
  ```bash
  npm run type-check
  ```

- [ ] Dashboard builds successfully:
  ```bash
  cd dashboard
  npm run build
  ```

- [ ] No console errors in development:
  ```bash
  npm run full:dev
  # Visit http://localhost:3000
  # Check browser console (F12)
  ```

---

## **Git Repository ✅**

- [ ] All changes committed:
  ```bash
  git status
  # Should show "nothing to commit"
  ```

- [ ] Repository pushed to GitHub:
  ```bash
  git push origin main
  # Check on github.com
  ```

- [ ] Repository is public (or you have access):
  - Go to your GitHub repo
  - Check visibility settings

---

## **Vercel Account ✅**

- [ ] Vercel account created at [vercel.com](https://vercel.com)
- [ ] Logged in with GitHub account
- [ ] GitHub authorization granted to Vercel

---

## **Environment Files ✅**

- [ ] `vercel.json` exists in root directory
- [ ] `dashboard/.env.example` exists
- [ ] `dashboard/.env.local` is in `.gitignore` (not committed)

---

## **Dashboard Configuration ✅**

- [ ] `dashboard/package.json` has correct scripts
- [ ] `dashboard/next.config.js` exists
- [ ] `dashboard/tsconfig.json` exists
- [ ] `dashboard/tailwind.config.ts` exists

---

## **Dependencies ✅**

- [ ] Backend dependencies installed:
  ```bash
  npm install
  ```

- [ ] Dashboard dependencies installed:
  ```bash
  cd dashboard
  npm install
  ```

- [ ] No dependency conflicts:
  ```bash
  npm audit
  # Should show 0 vulnerabilities (or only low-risk)
  ```

---

## **Build Test ✅**

Run a full build to ensure everything works:

```bash
# Clean previous builds
npm run clean

# Install fresh dependencies
npm install
cd dashboard && npm install && cd ..

# Build everything
npm run full:build

# Check for errors
# Should complete without errors
```

---

## **Ready to Deploy? ✅**

If all checkboxes are checked, you're ready!

```bash
# Final push to GitHub
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# Then go to vercel.com and import your project
```

---

## **Deployment Checklist**

When deploying on Vercel:

- [ ] Select correct Git repository
- [ ] Set root directory to `dashboard`
- [ ] Framework preset is `Next.js`
- [ ] Build command is `npm run build`
- [ ] Output directory is `.next`
- [ ] Add all environment variables
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Test the live URL

---

## **Post-Deployment Checklist**

After deployment:

- [ ] Visit the live URL
- [ ] Dashboard loads without errors
- [ ] Click on a region
- [ ] Verdict card appears
- [ ] Charts render correctly
- [ ] Adjust weights and see updates
- [ ] Check browser console (F12) for errors
- [ ] Test on mobile device
- [ ] Share the URL with others

---

## **Common Issues & Fixes**

### **Build Fails**
```bash
# Clear cache and rebuild locally
rm -rf dashboard/.next dashboard/node_modules
cd dashboard
npm install
npm run build
```

### **TypeScript Errors**
```bash
# Check for type errors
npm run type-check

# Fix any errors shown
```

### **Missing Dependencies**
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
cd dashboard
npm install
```

### **Environment Variables Not Working**
- Make sure they're prefixed with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check Vercel project settings

---

## **You're Ready! 🚀**

Once all checkboxes are checked, deploy to Vercel and share your dashboard with the world!

**The Referee is ready to serve! 🏟️**
