# Multi-stage Dockerfile for WagerKit (Hugging Face Spaces Compatible)

# Stage 1: Build Backend
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source and build
COPY backend ./
RUN npm run build

# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source
COPY frontend ./

# Build Next.js frontend (standalone mode)
ENV NEXT_PUBLIC_API_URL=/api
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine

WORKDIR /app

# Install dependencies for Redis and process management
RUN apk add --no-cache redis bash

# Copy backend production files
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/package.json ./backend/

# Copy backend .env (if exists)
COPY backend/.env ./backend/.env 2>/dev/null || true

# Copy frontend production files (standalone build)
COPY --from=frontend-build /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-build /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-build /app/frontend/public ./frontend/public
COPY --from=frontend-build /app/frontend/package.json ./frontend/

# Environment variables for Hugging Face Spaces
ENV NODE_ENV=production
ENV PORT=7860
ENV REDIS_HOST=127.0.0.1
ENV REDIS_PORT=6379
ENV NEXT_PUBLIC_API_URL=/api

# Expose Hugging Face Spaces default port
EXPOSE 7860

# Create comprehensive startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting WagerKit on Hugging Face Spaces..."

# Start Redis in background
echo "📦 Starting Redis..."
redis-server --daemonize yes --bind 127.0.0.1 --port 6379 --loglevel warning
sleep 2

# Verify Redis is running
redis-cli ping > /dev/null
echo "✅ Redis is ready"

# Start Backend in background
echo "🔧 Starting NestJS backend..."
cd /app/backend
PORT=3001 node dist/main.js &
BACKEND_PID=$!
sleep 3
echo "✅ Backend started (PID: $BACKEND_PID)"

# Start Frontend (foreground - keeps container alive)
echo "🌐 Starting Next.js frontend on port 7860..."
cd /app/frontend
PORT=7860 node server.js

EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
