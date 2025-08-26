# Doku Frontend - Development Scripts

This document explains the available npm scripts for developing and running the modernized Doku application.

## 🚀 Quick Start Commands

### Development Mode (Recommended for Development)

```bash
# Start both frontend and backend together
npm run dev:full

# Or start them separately in different terminals:
npm run dev:frontend    # React dev server on http://localhost:3000
npm run dev:backend     # Python backend on http://localhost:9090
```

### Production Mode

```bash
# Build and start production version
npm run start:prod      # Builds React app and starts Python server on http://localhost:9090

# Or step by step:
npm run build:prod      # Build React app for production
npm run dev:backend     # Start Python backend (serves built React app)
```

## 📋 Available Scripts

### Core Development Scripts

- **`npm run dev`** - Start Vite development server only (React frontend)
- **`npm run dev:frontend`** - Same as `dev`, start React development server
- **`npm run dev:backend`** - Start Python FastAPI backend server
- **`npm run dev:full`** - Start both frontend and backend simultaneously using concurrently

### Production Scripts  

- **`npm run build`** - Build React app for production (TypeScript check + Vite build)
- **`npm run build:prod`** - Same as `build`
- **`npm run start:prod`** - Build React app and start production server
- **`npm run preview`** - Preview production build using Vite's preview server

### Setup & Maintenance Scripts

- **`npm run setup`** - Install dependencies and build the app
- **`npm run clean`** - Remove build artifacts and cache
- **`npm run lint`** - Run ESLint for code quality checks
- **`npm run typecheck`** - Run TypeScript type checking without emitting files

### Docker Scripts

- **`npm run docker:build`** - Build Docker image from root directory
- **`npm run docker:run`** - Run Docker container with proper volume mounts
- **`npm run docker:dev`** - Start development environment using docker-compose

## 💡 Usage Examples

### For Active Development
```bash
# Terminal approach (run in separate terminals)
cd frontend
npm run dev:frontend     # Terminal 1: React dev server with hot reload

cd frontend  
npm run dev:backend      # Terminal 2: Python backend

# Single terminal approach
cd frontend
npm run dev:full         # Runs both servers in one terminal
```

### For Production Testing
```bash
cd frontend
npm run start:prod       # Builds and serves production version
# Access at http://localhost:9090
```

### For Docker Deployment
```bash
cd frontend
npm run docker:build     # Build the Docker image
npm run docker:run       # Run the container
```

## 🔧 Development Workflow

1. **Initial Setup:**
   ```bash
   cd frontend
   npm run setup
   ```

2. **Daily Development:**
   ```bash
   npm run dev:full        # Start both servers
   # Develop with hot reload on http://localhost:3000
   ```

3. **Before Committing:**
   ```bash
   npm run lint            # Check code quality
   npm run typecheck       # Check TypeScript errors
   npm run build           # Ensure production build works
   ```

4. **Production Deployment:**
   ```bash
   npm run docker:build    # Build Docker image
   npm run docker:run      # Deploy container
   ```

## 📱 Access Points

- **Development:** http://localhost:3000 (React dev server with hot reload)
- **Production:** http://localhost:9090 (Python server serving built React app)
- **Classic UI:** http://localhost:9090/site (Original HTML templates)
- **API Docs:** http://localhost:9090/docs (FastAPI auto-generated documentation)

## 🐛 Troubleshooting

- **Port conflicts:** The scripts expect ports 3000 and 9090 to be available
- **Python path:** Ensure Python is in your PATH for backend scripts to work
- **Build issues:** Run `npm run clean` and then `npm install` to refresh dependencies
