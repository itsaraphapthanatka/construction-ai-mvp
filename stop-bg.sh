#!/bin/bash

echo "🛑 Stopping Construction AI services..."

# วิธีที่ 1: ปิดโดยระบุ Port (แม่นยำที่สุด)
echo "Closing ports 3000, 3001, and 8001..."
fuser -k 3000/tcp 3001/tcp 8001/tcp 2>/dev/null

# วิธีที่ 2: ปิดโปรเซส Node และ Python (กรณีรันแบบ Background)
# pkill -f node
# pkill -f python

echo "✅ All services stopped."
