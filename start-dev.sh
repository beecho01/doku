#!/bin/bash

echo "🚀 Starting Doku Development Servers..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $1 is already in use"
        return 1
    fi
    return 0
}

# Check if ports are available
check_port 3000 || exit 1
check_port 9090 || exit 1

echo "✅ Ports are available"

# Check if frontend build exists
if [ ! -f "app/static/dist/index.html" ]; then
    echo "📦 Building frontend first..."
    cd frontend && npm run build && cd ..
fi

echo "🎯 Starting servers..."
echo "  Frontend (React): http://localhost:3000"
echo "  Backend (FastAPI): http://localhost:9090"
echo "  API Docs: http://localhost:9090/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Start both servers
npm run dev
