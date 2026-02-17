# 🚀 Deploy Backend-Only to Hugging Face Spaces

## Overview

This guide explains how to deploy **only the NestJS backend** from your GitHub monorepo to Hugging Face Spaces.

## 📁 What Gets Deployed

- ✅ **Backend** (NestJS + BullMQ + Redis)
- ❌ **Frontend** (stays in GitHub only)

## 🎯 Deployment Steps

### Step 1: Prepare Your Repository

Your GitHub repo already has the full monorepo. We'll tell HF Spaces to use only the backend.

**Two options:**

#### **Option A: Rename Dockerfile** (Easiest)
```powershell
# In c:\demo
# Temporarily rename the full-stack Dockerfile
Move-Item Dockerfile Dockerfile.fullstack

# Rename the backend-only Dockerfile to Dockerfile
Move-Item Dockerfile.backend Dockerfile

# Commit and push
git add .
git commit -m "Use backend-only Dockerfile for HF Spaces deployment"
git push origin main
```

#### **Option B: Keep Multiple Dockerfiles** (Flexible)
Keep `Dockerfile.backend` and configure HF Spaces to use it (explained below).

---

### Step 2: Create Hugging Face Space

1. Go to https://huggingface.co/new-space

2. Fill in the details:
   ```
   Space name:    wagerkit-backend (or your choice)
   License:       MIT
   SDK:           Docker  ⚠️ Must select Docker!
   Hardware:      CPU Basic (free)
   Visibility:    Public
   ```

3. Click **Create Space**

---

### Step 3: Connect to GitHub

You have two methods to get your code to HF Spaces:

#### **Method 1: Direct Push** (Simple)

```powershell
# Add HF Space as remote
git remote add space https://huggingface.co/spaces/YOUR-USERNAME/wagerkit-backend

# Push your code
git push space main
```

#### **Method 2: GitHub Sync** (Automatic Updates) ⭐ Recommended

**This method auto-deploys every time you push to GitHub!**

##### **Detailed Steps:**

1. **Create the Space first** (complete Step 2 above)

2. **Navigate to your Space's Settings:**
   - Go to your Space page: `https://huggingface.co/spaces/YOUR-USERNAME/wagerkit-backend`
   - Look at the top menu bar (same row as "App", "Files", "Community")
   - Click **"Settings"** (gear icon ⚙️)

3. **Find the Repository/Sync Section:**
   
   **Option A - If you see "Repository" or "Sync" tab:**
   - In Settings sidebar, look for **"Repository"** or **"Sync with GitHub"**
   - Click it
   - You'll see a button **"Link to GitHub"** or **"Connect to GitHub"**
   
   **Option B - If you see "Factory Reboot":**
   - Some HF Spaces interfaces show **"Factory Reboot"** instead
   - Look for **"Source code"** section
   - Click **"Link to GitHub repository"**
   
   **Option C - If you don't see any GitHub options:**
   - This is normal for newly created Spaces
   - **Use Method 1 (Direct Push) first** - see below
   - After first push, the GitHub sync option will appear

4. **Connect to GitHub:**
   - Click **"Link to GitHub"** or **"Connect repository"**
   - A popup opens asking for GitHub authorization
   - Click **"Authorize Hugging Face"** (you may need to sign in to GitHub)
   - HF will request permissions to read your repositories

5. **Select Your Repository:**
   - After authorization, you'll see a dropdown or list
   - Search for or select: `YOUR-GITHUB-USERNAME/demo` (or your repo name)
   - **Important:** Make sure the repo is **public** or you've granted HF access to private repos

6. **Configure Branch:**
   - **Branch to sync:** Select `main` (or `master` if that's your default)
   - **Path in repository:** Leave blank (HF will use root `/`)
   - **Dockerfile path:** Should auto-detect `Dockerfile` at root
     - If you kept `Dockerfile.backend`, set path to: `Dockerfile.backend`

7. **Save and Sync:**
   - Click **"Link repository"** or **"Connect"**
   - HF will immediately pull from GitHub and start building
   - You'll see build logs in the **Logs** tab

##### **Verification:**

Once connected, you should see:
- ✅ In Settings → Repository: Shows your GitHub repo URL
- ✅ Every `git push origin main` triggers automatic rebuild
- ✅ Space page shows "Connected to: github.com/YOUR-USERNAME/demo"

##### **⚠️ Troubleshooting: Can't Find Repository Settings?**

**Issue 1: "Settings has no Repository tab"**

**Solution:** The Space hasn't been initialized yet. Do Method 1 first:
```powershell
# Add HF Space as remote and push once
git remote add space https://huggingface.co/spaces/YOUR-USERNAME/wagerkit-backend
git push space main
```
After this first push, go back to Settings and the Repository/Sync option will appear.

---

**Issue 2: "Authorization keeps failing"**

**Solution:** 
1. Go to GitHub → Settings → Applications → Authorized OAuth Apps
2. Find "Hugging Face" and click it
3. Click **"Revoke access"**
4. Go back to HF Spaces and try connecting again (it will re-authorize)

---

**Issue 3: "Repository is not found"**

**Solution:**
- Ensure your GitHub repo is **public**, OR
- In HF authorization screen, grant access to the specific private repository
- Repo must already exist on GitHub before connecting

---

**Issue 4: "HF keeps using old code"**

**Solution:**
1. In Space Settings, look for **"Factory Reboot"**
2. Click **"Reboot Space"** to force rebuild from GitHub
3. Or push an empty commit to trigger rebuild:
   ```powershell
   git commit --allow-empty -m "Trigger HF rebuild"
   git push origin main
   ```

---

##### **Alternative: Use Method 1 First, Then Connect**

If you can't find the GitHub sync option:

```powershell
# Step 1: Push directly to HF Space first
git remote add space https://huggingface.co/spaces/YOUR-USERNAME/wagerkit-backend
git push space main

# Step 2: After first successful deployment, go to Settings
# Now the "Repository" or "Sync" tab should appear
# Follow steps above to link to GitHub

# Step 3: From now on, only push to GitHub
git push origin main  # This auto-deploys to HF Space
```

Now every push to GitHub main branch auto-deploys to HF Spaces! 🎉

---

### Step 4: Configure Dockerfile Path (If Using Option B)

If you kept `Dockerfile.backend` instead of renaming:

1. In your HF Space, go to **Settings**
2. Find **Docker** section
3. Set **Dockerfile path**: `Dockerfile.backend`
4. Click **Save**

---

### Step 5: Add Environment Variables (Optional)

If you want to change the DOME API key or add secrets:

1. In HF Space settings, go to **Variables and secrets**
2. Add secrets:
   ```
   Name:  DOME_API_KEY
   Value: your-actual-api-key-here
   ```
3. Update backend code to read from environment:
   ```typescript
   // backend/src/config/configuration.ts or .env
   DOME_API_KEY=process.env.DOME_API_KEY || 'default-key'
   ```

---

### Step 6: Wait for Build

- Build starts automatically after push
- **Build time:** ~5-10 minutes
- Watch logs in the **Logs** tab

**Build stages you'll see:**
```
[1/4] Building backend dependencies...
[2/4] Copying source files...
[3/4] Building NestJS application...
[4/4] Creating runtime image...
```

---

### Step 7: Access Your Backend API

Once deployed (status shows "Running" with green dot):

**Your API will be at:**
```
https://YOUR-USERNAME-wagerkit-backend.hf.space/api/markets
```

**Example endpoints:**
```
GET  https://YOUR-USERNAME-wagerkit-backend.hf.space/api/markets
GET  https://YOUR-USERNAME-wagerkit-backend.hf.space/api/markets/us_election_2024_winner
GET  https://YOUR-USERNAME-wagerkit-backend.hf.space/api/markets/jobs/status
POST https://YOUR-USERNAME-wagerkit-backend.hf.space/api/markets/us_election_2024_winner/refresh
```

---

## 🧪 Testing Your Deployment

### Test in Browser

Visit: `https://YOUR-USERNAME-wagerkit-backend.hf.space/api/markets`

You should see JSON with 3 markets.

### Test with PowerShell

```powershell
# Replace with your actual Space URL
$url = "https://YOUR-USERNAME-wagerkit-backend.hf.space/api/markets"

# Test markets endpoint
Invoke-RestMethod -Uri $url | ConvertTo-Json

# Test specific market
Invoke-RestMethod -Uri "$url/us_election_2024_winner" | ConvertTo-Json
```

### Test with cURL

```bash
curl https://YOUR-USERNAME-wagerkit-backend.hf.space/api/markets
```

---

## 🔧 Important Configuration

### Port Configuration

The `Dockerfile.backend` is configured for HF Spaces:
- **External port:** 7860 (HF Spaces requirement)
- **Redis port:** 6379 (internal only)
- **Backend serves on:** 7860

### Redis Configuration

Redis is embedded in the container:
- **No external Redis needed** ✅
- Starts automatically with the backend
- Data is **not persistent** (resets on restart)

---

## 🐛 Troubleshooting

### Build Fails

**Check logs:**
1. Go to your Space → **Logs** tab
2. Look for red error messages

**Common issues:**

| Error | Solution |
|-------|----------|
| `Cannot find module` | Check `backend/package.json` includes all dependencies |
| `COPY failed` | Ensure `backend/` folder exists in repo |
| `npm ci failed` | Delete `package-lock.json`, regenerate with `npm install` |
| `Build timeout` | Free tier has 1GB RAM limit - try optimizing dependencies |

### App Not Starting

**Check runtime logs:**
1. Space → **Logs** tab (after build completes)
2. Look for startup messages

**Common issues:**

| Issue | Solution |
|-------|----------|
| Redis not starting | Check startup script logs, ensure Redis installed |
| Port binding error | Dockerfile must use PORT=7860 |
| Application crash | Check environment variables, missing .env values |

### API Returns Empty Data

**Check market processing:**
```powershell
# Check job status
Invoke-RestMethod -Uri "https://YOUR-URL.hf.space/api/markets/jobs/status"
```

**If jobs are stuck:**
- Redis might not be running
- Check logs for BullMQ errors
- Try refreshing a market manually:
  ```powershell
  Invoke-RestMethod -Method POST -Uri "https://YOUR-URL.hf.space/api/markets/us_election_2024_winner/refresh"
  ```

### Slow Response Times

Free tier CPU Basic has limited resources (2 vCPU, 16GB storage).

**Solutions:**
- ✅ Reduce number of markets processed simultaneously
- ✅ Increase cache duration
- ✅ Upgrade to CPU Medium ($5/month)

---

## 📊 Monitoring

### Check Application Health

HF Spaces shows status dot:
- 🟢 **Green (Running):** All good
- 🟡 **Yellow (Building):** Deployment in progress
- 🔴 **Red (Error):** Application crashed

### Check Background Jobs

```powershell
$status = Invoke-RestMethod -Uri "https://YOUR-URL.hf.space/api/markets/jobs/status"
$status | Format-List
```

Expected output:
```
queuedJobs    : 0
activeJobs    : 0
completedJobs : 3
failedJobs    : 0
```

---

## 🔄 Updating Your Deployment

### If Using Direct Push:
```powershell
# Make changes to backend code
# Commit changes
git add .
git commit -m "Update backend logic"

# Push to HF Space (triggers rebuild)
git push space main
```

### If Using GitHub Sync:
```powershell
# Just push to GitHub
git push origin main
# HF Space auto-deploys! 🚀
```

Rebuild takes ~5-10 minutes.

---

## 🎨 Optional: Custom Domain

HF Spaces Pro allows custom domains:

1. Upgrade to HF Pro
2. Go to Space settings → **Domain**
3. Add your domain (e.g., `api.wagerkit.com`)
4. Update DNS records as shown

---

## 📁 What's NOT Deployed

Since this is backend-only:

- ❌ Next.js frontend (stays in GitHub)
- ❌ Frontend's node_modules
- ❌ Frontend's build artifacts

**To access the API from a frontend elsewhere:**
```typescript
// In your frontend deployed somewhere else
const API_URL = 'https://YOUR-USERNAME-wagerkit-backend.hf.space/api';

const markets = await fetch(`${API_URL}/markets`).then(r => r.json());
```

---

## 🚀 Next Steps

1. **Test all endpoints** to ensure they work
2. **Update DOME_API_KEY** if needed (via HF Secrets)
3. **Monitor usage** in HF Space → Analytics
4. **Deploy frontend separately** (Vercel, Netlify, or another HF Space)
5. **Set up CORS** if frontend is on different domain

---

## 💡 Pro Tips

✅ **Use GitHub Sync** for automatic deployments
✅ **Add health checks** in your NestJS app
✅ **Log important events** for debugging
✅ **Use HF Secrets** for sensitive data (API keys)
✅ **Monitor build times** - optimize if builds take >10 mins
✅ **Test locally first** with Docker: `docker build -f Dockerfile.backend -t wagerkit-backend .`

---

## 🆘 Need Help?

- **HF Spaces Docs:** https://huggingface.co/docs/hub/spaces
- **Build logs:** Your Space → Logs tab
- **Community:** https://discuss.huggingface.co/

---

**Your backend is now running on Hugging Face Spaces at port 7860! 🎉**
