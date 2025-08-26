#!/bin/bash

# Doku Development Setup Script
echo "🚀 Setting up Doku development environment..."

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo "❌ Bun is required but not installed. Please install Bun first:"
    echo "   curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
    echo "❌ Python is required but not installed. Please install Python 3.11+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
bun install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

echo "🏗️ Building frontend..."
bun run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Python dependency installation failed"
    exit 1
fi

echo "✅ Setup completed successfully!"
echo ""
echo "🎯 Quick start commands (run from project root):"
echo "  Development (single command):"
echo "    bun run dev              # Starts both React + Python servers"
echo ""
echo "  Development (alternative names):"
echo "    bun run dev:full         # Same as 'dev'"
echo "    bun run frontend:dev     # React dev server only (port 3000)"
echo "    bun run backend:dev      # Python backend only (port 9090)"
echo ""
echo "  Production:"
echo "    bun run start            # Build + serve production version"
echo "    bun run start:prod       # Same as 'start'"
echo ""
echo "  Docker:"
echo "    bun run docker:build && bun run docker:run"
echo ""
echo "🌟 Access points:"
echo "  Modern UI (dev): http://localhost:3000"
echo "  Modern UI (prod): http://localhost:9090"
echo "  Classic UI: http://localhost:9090/site"
echo "  API docs: http://localhost:9090/docs"
