# 🔗 Connect Frontend to Hugging Face Backend

Your backend is deployed at: **https://saadrizvi09-wagerkit.hf.space**

This guide shows how to configure your **local frontend** to connect to your **HF Space backend**.

---

## 🎯 Quick Setup

### **Option 1: Use Pre-configured Production Env** (Easiest)

```powershell
# Copy the production HF config to your local env
cd c:\demo\frontend
Copy-Item .env.production.hf .env.local -Force
```

### **Option 2: Edit Manually**

Open `c:\demo\frontend\.env.local` and change:

```dotenv
# FROM (local backend):
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# TO (HF Space backend):
NEXT_PUBLIC_API_URL=https://saadrizvi09-wagerkit.hf.space/api
```

---

## 🚀 Start Frontend

After changing the env variable:

```powershell
cd c:\demo\frontend
npm run dev
```

Open: http://localhost:3000

Your frontend will now fetch data from the HF Space backend! 🎉

---

## 🧪 Test the Connection

### **1. Test Backend Directly**

First verify your HF Space backend is running:

**In browser:**
```
https://saadrizvi09-wagerkit.hf.space/api/markets
```

**In PowerShell:**
```powershell
$url = "https://saadrizvi09-wagerkit.hf.space/api/markets"
Invoke-RestMethod -Uri $url | ConvertTo-Json -Depth 3
```

You should see 3 markets (Election, BTC, CPI).

---

### **2. Test Frontend with HF Backend**

1. Update `.env.local` to use HF Space URL (see above)
2. Restart frontend: `npm run dev`
3. Open http://localhost:3000/dashboard
4. Cards should show data from HF Space backend

**Check Network Tab (F12 → Network):**
- Look for requests to `https://saadrizvi09-wagerkit.hf.space/api/markets`
- Status should be `200 OK`

---

## 🔧 Troubleshooting

### **Issue 1: CORS Error**

**Error:** `Access-Control-Allow-Origin header is missing`

**Solution:** The backend's CORS is already configured to allow HF Spaces domains. If you still see this error:

1. Check backend logs in HF Space
2. Verify the backend is running (green status dot)
3. Backend's `main.ts` already has:
   ```typescript
   origin: [
     'http://localhost:3000',
     'http://localhost:7860',
     /\.hf\.space$/,  // Allows all HF Spaces
   ]
   ```

---

### **Issue 2: Network Error / Connection Refused**

**Solutions:**
1. **Check backend status:** Go to https://huggingface.co/spaces/saadrizvi09/wagerkit
   - Status should be 🟢 Running
   - If 🟡 Building, wait 5-10 mins
   - If 🔴 Error, check Logs tab
2. **Verify URL:** Make sure env has `/api` at the end
3. **Clear browser cache:** Hard refresh (Ctrl+Shift+R)

---

### **Issue 3: Empty Dashboard**

**If cards show "Processing..." forever:**

1. **Check job status:**
   ```powershell
   Invoke-RestMethod -Uri "https://saadrizvi09-wagerkit.hf.space/api/markets/jobs/status"
   ```

2. **Manually refresh a market:**
   ```powershell
   Invoke-RestMethod -Method POST -Uri "https://saadrizvi09-wagerkit.hf.space/api/markets/us_election_2024_winner/refresh"
   ```

3. **Check backend logs:** HF Space → Logs tab
   - Look for BullMQ/Redis errors
   - Verify Redis started successfully

---

### **Issue 4: Slow Response**

HF Spaces free tier has limited CPU. First requests may be slow (cold start).

**Solutions:**
- Wait 10-20 seconds for first load
- Subsequent requests should be faster
- Upgrade to HF Spaces CPU Medium for better performance

---

## 🌐 Deploy Frontend Separately

If you want to deploy the frontend elsewhere (Vercel, Netlify, etc.):

### **For Vercel:**

1. Push your code to GitHub (already done ✅)
2. Go to https://vercel.com/new
3. Import: `saadrizvi09/wager-kit-demo`
4. **Root Directory:** `frontend`
5. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://saadrizvi09-wagerkit.hf.space/api
   ```
6. Deploy

Your frontend will be at: `https://your-project.vercel.app`

---

### **For Netlify:**

1. Go to https://app.netlify.com/start
2. Connect to GitHub repo: `saadrizvi09/wager-kit-demo`
3. **Base directory:** `frontend`
4. **Build command:** `npm run build`
5. **Publish directory:** `.next`
6. **Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://saadrizvi09-wagerkit.hf.space/api
   ```
7. Deploy

---

### **For Another HF Space (Full-Stack):**

If you want both frontend + backend in one HF Space:

1. Create new Space with Docker SDK
2. Use the original `Dockerfile.fullstack` instead
3. Push code
4. Frontend will be at: `https://your-space.hf.space`

---

## 📝 Environment Variable Reference

| Environment | API URL | Use Case |
|-------------|---------|----------|
| **Local Dev (both)** | `http://localhost:3001/api` | Backend + Frontend on localhost |
| **Frontend → HF Backend** | `https://saadrizvi09-wagerkit.hf.space/api` | Local frontend, deployed backend |
| **Vercel/Netlify → HF Backend** | `https://saadrizvi09-wagerkit.hf.space/api` | Deployed frontend, HF backend |
| **Docker Full-Stack** | `/api` | Both in same container |

---

## 🔄 Switch Between Backends

You can easily switch between local and HF backends:

### **Use Local Backend:**
```powershell
cd c:\demo\frontend
Copy-Item .env.local.example .env.local
# Edit to: NEXT_PUBLIC_API_URL=http://localhost:3001/api
npm run dev
```

### **Use HF Space Backend:**
```powershell
cd c:\demo\frontend
Copy-Item .env.production.hf .env.local -Force
npm run dev
```

### **Restart is Required:**
You MUST restart the frontend dev server after changing `.env.local`:
```powershell
# Stop: Ctrl+C
# Start:
npm run dev
```

---

## ✅ Verify Connection

After setup, check:

1. ✅ HF Backend is running (green dot)
2. ✅ Frontend `.env.local` has HF Space URL
3. ✅ Frontend restarted after env change
4. ✅ Dashboard loads market cards with data
5. ✅ Network tab shows requests to HF Space URL

---

## 🎉 Your Setup

**Backend (HF Space):**
- URL: https://saadrizvi09-wagerkit.hf.space
- API: https://saadrizvi09-wagerkit.hf.space/api/markets
- Status: Check at https://huggingface.co/spaces/saadrizvi09/wagerkit

**Frontend (Local):**
- URL: http://localhost:3000
- Connected to: HF Space backend (after env change)

**GitHub:**
- Repo: https://github.com/saadrizvi09/wager-kit-demo

---

## 💡 Pro Tips

✅ **Keep `.env.local` in gitignore** - Never commit API keys
✅ **Use `.env.example`** - Document what variables are needed
✅ **Test backend first** - Always verify backend works before connecting frontend
✅ **Check CORS** - Backend must allow your frontend's origin
✅ **Monitor HF logs** - Watch for errors when frontend makes requests
✅ **Use environment variables** - Never hardcode URLs in components

---

**Your frontend is now ready to connect to the HF Space backend! 🚀**
