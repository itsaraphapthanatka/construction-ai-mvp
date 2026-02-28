cat << 'EOF' > ~/construction-ai-mvp/start-bg.sh
#!/bin/bash
ROOT_DIR=~/construction-ai-mvp

echo "🧹 Cleaning up old processes..."
sudo pkill -9 node 2>/dev/null
sudo pkill -9 python 2>/dev/null

echo "🚀 Starting Construction AI services..."

# 1. Start Backend (3001)
echo "▶️ Starting Backend API..."
cd $ROOT_DIR/backend && npm run dev > $ROOT_DIR/backend.log 2>&1 &

# 2. Start Frontend (3000)
echo "▶️ Starting Frontend Dashboard..."
cd $ROOT_DIR/frontend && npm run dev > $ROOT_DIR/frontend.log 2>&1 &

# 3. Start AI Service (8001)
echo "▶️ Starting AI Service on Port 8001..."
cd $ROOT_DIR/ai-service && ./venv/bin/python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 > $ROOT_DIR/ai.log 2>&1 &

echo ""
echo "✅ All services are starting in background!"
echo "Check status: netstat -tunlp | grep -E '3000|3001|8001'"
EOF

chmod +x ~/construction-ai-mvp/start-bg.sh