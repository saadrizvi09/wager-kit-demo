# Backend-Only Dockerfile for Hugging Face Spaces
# Includes Redis for BullMQ job processing

FROM node:20-alpine

WORKDIR /app

# Install Redis and bash
RUN apk add --no-cache redis bash curl

# Copy backend package files
COPY backend/package*.json ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy backend source
COPY backend ./

# Build NestJS application
RUN npm run build

# Remove dev dependencies to reduce image size (optional but recommended)
RUN npm prune --omit=dev

# Environment variables for HF Spaces
ENV NODE_ENV=production
ENV PORT=7860
ENV REDIS_HOST=127.0.0.1
ENV REDIS_PORT=6379

# Expose HF Spaces default port
EXPOSE 7860

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting WagerKit Backend on Hugging Face Spaces..."

# Start Redis in background
echo "📦 Starting Redis..."
redis-server --daemonize yes --bind 127.0.0.1 --port 6379 --loglevel warning --save ""
sleep 2

# Verify Redis is running
if redis-cli ping > /dev/null 2>&1; then
  echo "✅ Redis is ready"
else
  echo "❌ Redis failed to start"
  exit 1
fi

# Start NestJS backend on port 7860
echo "🔧 Starting NestJS backend on port 7860..."
PORT=7860 node dist/main.js

EOF

RUN chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:7860/api/markets || exit 1

CMD ["/app/start.sh"]
