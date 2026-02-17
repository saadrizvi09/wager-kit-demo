---
title: WagerKit
emoji: 📊
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
license: mit
---

# WagerKit 🎯

**Real-time prediction market analysis with integrity scoring**

WagerKit aggregates data from multiple prediction market sources (Polymarket, Kalshi, PredictIt) and provides comprehensive integrity analysis for each market.

## ✨ Features

- 📈 **Multi-Source Aggregation**: Compare odds across leading prediction markets
- 🎯 **Integrity Scoring**: 4-component analysis (Clarity, Liquidity, Agreement, Volatility)
- 📊 **Visual Analytics**: Real-time odds history charts with Chart.js
- 📥 **Export Tools**: PDF dossiers, CSV data exports, JSON metadata
- ⚡ **Background Processing**: BullMQ-powered workers for instant dashboard loads
- 🎨 **Modern UI**: Dark theme, responsive design with Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│      Docker Container (HF Space)    │
│                                     │
│  Redis ──► NestJS Backend (BullMQ) │
│              ↓                      │
│         Next.js Frontend            │
│           (Port 7860)               │
└─────────────────────────────────────┘
```

## 🚀 Quick Start

### On Hugging Face Spaces

Simply clone this Space or visit the live demo!

### Local Development

```bash
# Clone the repository
git clone <your-repo-url>
cd wagerkit

# Start with Docker Compose
docker-compose up

# Or run individually:
# Terminal 1: Redis
docker run -d -p 6379:6379 redis:7-alpine

# Terminal 2: Backend
cd backend && npm install && npm run start:dev

# Terminal 3: Frontend
cd frontend && npm install && npm run dev
```

Access at: http://localhost:3000

## 📊 Integrity Score Formula

**Overall Score** = 100 × (0.40×C + 0.30×L + 0.20×A + 0.10×V)

- **C** (Market Clarity): Resolution criteria quality, source coverage
- **L** (Liquidity Depth): Trading volume, update frequency
- **A** (Cross-Source Agreement): RMSE between sources
- **V** (Volatility Sanity): Price stability, spike detection

## 🛠️ Tech Stack

**Backend:**
- NestJS 10 (TypeScript)
- BullMQ (background jobs)
- Redis (job queue & cache)

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Chart.js (visualization)
- Tailwind CSS (styling)
- jsPDF (PDF export)

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- Hugging Face Spaces setup
- Docker configuration
- Environment variables
- Local development

## 🎮 Usage

1. **Dashboard**: View all markets with processing status badges
2. **Click any card**: Navigate to detailed market analysis
3. **View Charts**: Compare historical odds across 4 sources
4. **Export Data**: Download PDF dossiers, CSV odds history, or JSON metadata

## 📁 Project Structure

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
├── DEPLOYMENT.md          # Detailed deployment guide
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 🙏 Acknowledgments

Built with data from leading prediction markets. This is a demonstration project showcasing real-time data aggregation and integrity analysis techniques.

---

**Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)
Each market includes:
- **Integrity Score** (0-100) with 4 sub-components:
  - Market Clarity (40% weight)
  - Liquidity Depth (30% weight)
  - Cross-Source Agreement (20% weight)
  - Volatility Sanity (10% weight)
- **Odds History Chart** - 24-hour price trends from 3 sources
- **Data Sources** - Polymarket, Kalshi, PredictIt
- **Export Options**:
  - ✅ Download Dossier (PDF)
  - ✅ Download Dossier (JSON)
  - ✅ Export Odds CSV
  - ✅ Export Integrity CSV

## 📊 Integrity Score Formula

```
Score = 100 × (0.40×C + 0.30×L + 0.20×A + 0.10×V)
```

Where:
- **C** = Market Clarity
- **L** = Liquidity Depth
- **A** = Cross-Source Agreement (RMSE-based)
- **V** = Volatility Sanity (includes spike detection)

## 🔧 Tech Stack

### Backend
- NestJS 10
- TypeScript
- JWT Authentication (ready but disabled)
- Express.js

### Frontend
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Chart.js (for odds visualization)
- jsPDF (for PDF exports)

## 📝 API Endpoints

### Markets
- `GET /api/markets` - List all markets
- `GET /api/markets/:slug` - Get market detail with integrity scores
- `GET /api/markets/:slug/export/odds-csv` - Export odds history CSV
- `GET /api/markets/:slug/export/integrity-csv` - Export integrity scores CSV
- `GET /api/markets/:slug/export/dossier-json` - Export full dossier JSON

### Authentication (Optional)
- `POST /api/auth/login` - Login endpoint (not required for demo)

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
JWT_SECRET=wagerkit-jwt-secret-key-2024
DOME_API_KEY=your-dome-api-key-here
PORT=3001
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🎨 Design Theme
- Dark purple/blue gradient background
- Card-based UI with `#12121e` background
- Purple (`#6b21a8`) and blue (`#3b82f6`) accent colors
- Responsive design with Tailwind CSS

## 🔮 DOME API Integration (Future)

The app is designed to integrate with the DOME API. To enable real data:

1. **Install SDK**:
   ```bash
   cd backend
   npm install @dome-api/sdk
   ```

2. **Add API Key** to `backend/.env`:
   ```env
   DOME_API_KEY=your-actual-api-key
   ```

3. **Update Service** in `backend/src/markets/markets.service.ts`:
   - Uncomment the DOME SDK import
   - Replace simulated data methods with real API calls

Currently uses simulated data with realistic patterns for demo purposes.

## 🚢 Deployment

### Build Production
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm start
```

## 📋 Notes
- Authentication is **disabled** for easy demo access
- Data is **simulated** but follows real market patterns
- All export features are **fully functional**
- Runs entirely locally - no external dependencies required

---

**Built for client demo - February 2026**
