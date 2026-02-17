# 🚀 Hugging Face Spaces Deployment Guide

## Step-by-Step Instructions

### 1. Create a New Space

1. Go to https://huggingface.co/new-space
2. Fill in the details:
   - **Name**: `wagerkit` (or your preferred name)
   - **License**: MIT
   - **SDK**: Select **Docker**
   - **Hardware**: CPU Basic (free tier is sufficient)
   - **Visibility**: Public (or Private if you prefer)
3. Click **Create Space**

### 2. Push Your Code to the Space

```bash
# Navigate to your project directory
cd c:\demo

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: WagerKit prediction market analysis"

# Add your Hugging Face Space as a remote
git remote add space https://huggingface.co/spaces/<your-username>/<space-name>

# Push to the Space
git push space main
```

### 3. Wait for Build

- The Space will automatically start building
- Build time: ~5-10 minutes
- You can watch the build logs in the Space's "Logs" tab

### 4. Access Your Deployed App

Once the build completes, your app will be available at:
```
https://<your-username>-<space-name>.hf.space
```

Example: `https://johndoe-wagerkit.hf.space`

## 🔧 Configuration

### Optional: Add Secrets

If you want to use a real DOME API key:

1. In your Space settings, go to **Variables and secrets**
2. Add a new secret:
   - **Name**: `DOME_API_KEY`
   - **Value**: Your actual DOME API key

### Port Configuration

The Dockerfile is pre-configured for Hugging Face Spaces:
- Uses port **7860** (HF Spaces default)
- Backend runs on internal port 3001
- Frontend (port 7860) proxies API requests to backend

## 🐛 Troubleshooting

### Build Fails

**Check the build logs:**
1. Go to your Space
2. Click the "Logs" tab
3. Look for error messages

**Common issues:**
- Missing dependencies: Ensure `package.json` is complete
- Build timeout: The free tier has build time limits
- Memory issues: Try optimizing your build process

### App Not Responding

**Check the runtime logs:**
1. Go to your Space
2. Click the "Logs" tab (after build)
3. Look for runtime errors

**Common issues:**
- Redis not starting: Check the startup script logs
- Backend crash: Check for missing environment variables
- Port conflicts: Ensure using port 7860

### Slow Performance

Free tier CPU Basic has limited resources. Consider:
- Upgrading to CPU Medium (paid)
- Optimizing your code
- Adding caching

## 📊 Monitoring

### Health Checks

Your app includes automatic health monitoring:
- Redis health: Checked on startup
- Backend health: Automatic restart if crashes
- Frontend health: Next.js handles gracefully

### Logs

View real-time logs in your Space:
```
Settings → Logs
```

Look for:
- `✅ Redis is ready` - Confirms Redis started
- `✅ Backend started` - Confirms backend is running
- `🌐 Starting Next.js frontend` - Confirms frontend is starting

## 🔄 Updates

To update your deployed app:

```bash
# Make your changes
git add .
git commit -m "Description of changes"

# Push to Space
git push space main
```

The Space will automatically rebuild and redeploy.

## 💰 Cost

**Free Tier (CPU Basic):**
- ✅ Sufficient for demo/development
- ✅ Auto-sleeps after inactivity
- ✅ No credit card required

**Paid Tiers:**
- CPU Medium: Better performance
- GPU: Not needed for this app

## 🎓 Next Steps

1. **Test your deployment**: Visit your Space URL
2. **Share**: Your Space is now public (if you chose public visibility)
3. **Monitor**: Check logs for any issues
4. **Optimize**: Add caching, optimize queries
5. **Extend**: Add more markets, features

## 📚 Resources

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Docker Spaces Guide](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [WagerKit Deployment Guide](./DEPLOYMENT.md)

## ✨ Success Criteria

Your deployment is successful when:
- ✅ Space shows "Running" status
- ✅ You can access the URL
- ✅ Dashboard shows 3 markets
- ✅ Clicking a card opens the detail page
- ✅ Charts render correctly
- ✅ Export buttons work

---

**Questions?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for more details or open an issue on GitHub.
