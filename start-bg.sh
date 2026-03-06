#!/bin/bash
ROOT_DIR=$(pwd)

echo "🧹 Cleaning up old processes..."
pkill -f "node" 2>/dev/null
pkill -f "uvicorn" 2>/dev/null

echo "🚀 Starting Construction AI services..."

# 1. Start Backend (3001)
echo "▶️ Starting Backend API..."
cd "$ROOT_DIR/backend" && npm run dev > "$ROOT_DIR/backend.log" 2>&1 &

# 2. Start Frontend (3000)
echo "▶️ Starting Frontend Dashboard..."
cd "$ROOT_DIR/frontend" && npm run dev > "$ROOT_DIR/frontend.log" 2>&1 &

# 3. Start AI Service (8001)
echo "▶️ Starting AI Service on Port 8001..."
cd "$ROOT_DIR/ai-service" && ../.venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8001 > "$ROOT_DIR/ai.log" 2>&1 &

echo "✅ Services are starting in the background."
echo "📝 Logs: backend.log, frontend.log, ai.log"
