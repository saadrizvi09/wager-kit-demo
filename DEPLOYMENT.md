# WagerKit - Hugging Face Spaces Deployment Guide

## Quick Start

### Option 1: Hugging Face Spaces (Recommended for Demo)

1. **Create a new Docker Space on Hugging Face**
   - Go to https://huggingface.co/new-space
   - Choose "Docker" as the SDK
   - Name your space (e.g., `wagerkit-demo`)

2. **Clone this repository and push to your Space**
   ```bash
   git clone <your-repo-url>
   cd wagerkit
   git remote add space https://huggingface.co/spaces/<your-username>/<space-name>
   git push space main
   ```

3. **Configure Space Settings**
   - In your Space settings, set:
     - **Hardware**: CPU Basic (free tier)
     - **Visibility**: Public
   - Add secrets (optional):
     - `DOME_API_KEY`: Your DOME API key

4. **The Space will automatically build and deploy**
   - Build time: ~5-10 minutes
   - Access URL: `https://<your-username>-<space-name>.hf.space`

### Option 2: Local Development with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the app at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

### Option 3: Local Development (Without Docker)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 3 - Redis:**
```bash
docker run -d --name wagerkit-redis -p 6379:6379 redis:7-alpine
```

## Architecture

```
┌─────────────────────────────────────────────┐
│           Hugging Face Spaces               │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │         Docker Container              │  │
│  │                                       │  │
│  │  ┌──────────┐    ┌─────────────┐    │  │
│  │  │  Redis   │◄───┤   Backend   │    │  │
│  │  │  :6379   │    │  NestJS API │    │  │
│  │  └──────────┘    │   :3001     │    │  │
│  │                  └──────▲──────┘    │  │
│  │                         │            │  │
│  │                  ┌──────┴──────┐    │  │
│  │                  │  Frontend   │    │  │
│  │                  │  Next.js    │    │  │
│  │                  │   :7860     │    │  │
│  │                  └─────────────┘    │  │
│  │                                       │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

## Project Structure

```
wagerkit/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── markets/        # Markets module (BullMQ workers)
│   │   ├── auth/           # Auth module (unused in demo)
│   │   └── main.ts
│   ├── Dockerfile          # Backend Docker image
│   └── package.json
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   └── lib/           # API client
│   ├── Dockerfile         # Frontend Docker image
│   └── package.json
├── Dockerfile             # Multi-stage build (HF Spaces)
├── docker-compose.yml     # Local development
└── README.md
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
DOME_API_KEY=your_dome_api_key_here
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Features

✅ **Background Processing with BullMQ**
- Markets are pre-processed on startup
- Dashboard loads instantly with cached data
- Redis-backed job queue

✅ **Integrity Score Calculation**
- Market Clarity (40% weight)
- Liquidity Depth (30% weight)
- Cross-Source Agreement (20% weight)
- Volatility Sanity (10% weight)

✅ **Data Visualization**
- Real-time odds history charts (Chart.js)
- Multi-source comparison (Polymarket, Kalshi, PredictIt, WagerKit)
- Dark theme UI with Tailwind CSS

✅ **Export Functionality**
- PDF dossier generation (jsPDF)
- Odds history CSV export
- Integrity metrics JSON export

## Troubleshooting

### Hugging Face Spaces Build Failing

1. **Check build logs in Space settings**
2. **Verify Dockerfile syntax**:
   ```bash
   docker build -t wagerkit-test -f Dockerfile .
   ```
3. **Ensure all dependencies are specified in package.json**

### Redis Connection Issues

If you see "ECONNREFUSED 127.0.0.1:6379":
- Ensure Redis is running in the container
- Check `REDIS_HOST` environment variable
- Verify Redis is starting before the backend

### Port Conflicts (Local Development)

```bash
# Kill processes on ports 3000, 3001, 6379
npx kill-port 3000 3001 6379
```

### Frontend API Connection

If frontend can't reach backend:
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running on expected port
- Check browser console for CORS errors

## Production Deployment Best Practices

1. **Use environment-specific API URLs**
   ```javascript
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.com/api';
   ```

2. **Enable Redis persistence**
   ```bash
   redis-server --appendonly yes
   ```

3. **Set up health checks**
   - Backend: `GET /health`
   - Frontend: `GET /api/health`

4. **Configure resource limits** (docker-compose.yml)
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '1.0'
         memory: 1G
   ```

## Support

For issues or questions:
- GitHub Issues: [Your Repo URL]
- Documentation: [Your Docs URL]

## License

[Your License]
