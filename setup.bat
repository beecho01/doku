@echo off
echo 🚀 Setting up Doku development environment...

:: Check if Bun is installed
bun --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Bun is required but not installed. Please install Bun first:
    echo    https://bun.sh/docs/installation
    pause
    exit /b 1
)

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is required but not installed. Please install Python 3.11+ first.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed

:: Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
call bun install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)

echo 🏗️ Building frontend...
call bun run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed
    pause
    exit /b 1
)

cd ..

:: Install Python dependencies
echo 🐍 Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Python dependency installation failed
    pause
    exit /b 1
)

echo ✅ Setup completed successfully!
echo.
echo 🎯 Quick start commands (run from project root):
echo   Development (single command):
echo     bun run dev              # Starts both React + Python servers
echo.
echo   Development (alternative names):
echo     bun run dev:full         # Same as 'dev'
echo     bun run frontend:dev     # React dev server only (port 3000)
echo     bun run backend:dev      # Python backend only (port 9090)
echo.
echo   Production:
echo     bun run start            # Build + serve production version
echo     bun run start:prod       # Same as 'start'
echo.
echo   Docker:
echo     bun run docker:build ^&^& bun run docker:run
echo.
echo 🌟 Access points:
echo   Modern UI (dev): http://localhost:3000
echo   Modern UI (prod): http://localhost:9090
echo   Classic UI: http://localhost:9090/site
echo   API docs: http://localhost:9090/docs
pause
