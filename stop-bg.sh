#!/bin/bash

echo "🛑 Stopping Construction AI services..."

# ปิด Process ที่จอง Port 3000, 3001 และ 8001
for port in 3000 3001 8001
do
    pid=$(lsof -t -i:$port)
    if [ -z "$pid" ]; then
        echo "Port $port is already free."
    else
        echo "Closing process on port $port (PID: $pid)..."
        kill -9 $pid
    fi
done

echo "✅ All services stopped."
