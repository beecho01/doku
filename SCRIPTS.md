# Doku - Development Scripts Reference

This document explains all available Bun scripts for the modernized Doku application. All commands should be run from the **project root directory**.

## 🚀 Quick Start Commands

### Development Mode
```bash
bun run dev              # Start both React dev server (3000) + Python backend (9090)
bun run dev:full         # Same as 'dev' - alternative name
```

### Production Mode  
```bash
bun run start            # Build React app + start production server on port 9090
bun run start:prod       # Same as 'start' - alternative name
```

## 📋 Complete Script Reference

### 🔧 Development Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start both frontend and backend development servers |
| `bun run dev:full` | Same as `dev` (alternative name) |
| `bun run frontend:dev` | Start only React development server (port 3000) |
| `bun run backend:dev` | Start only Python FastAPI backend (port 9090) |

### 🏗️ Build Scripts

| Script | Description |
|--------|-------------|
| `bun run build` | Build React frontend for production |
| `bun run build:frontend` | Same as `build` (explicit name) |
| `bun run build:prod` | Same as `build` (alternative name) |

### 🚀 Production Scripts

| Script | Description |
|--------|-------------|
| `bun run start` | Build frontend + start production server |
| `bun run start:prod` | Same as `start` (alternative name) |
| `bun run preview` | Preview production build using Vite |

### 🛠️ Setup & Maintenance

| Script | Description |
|--------|-------------|
| `bun run setup` | Install frontend dependencies + build production |
| `bun run setup:sh` | Run setup.sh script (Unix/Mac) |
| `bun run setup:bat` | Run setup.bat script (Windows) |
| `bun run clean` | Remove build artifacts and cache |

### 🧪 Quality Assurance

| Script | Description |
|--------|-------------|
| `bun run lint` | Run ESLint on frontend code |
| `bun run typecheck` | Run TypeScript type checking |
| `bun run test:frontend` | Run frontend tests |
| `bun run test:backend` | Run Python backend tests |

### 🐳 Docker Scripts

| Script | Description |
|--------|-------------|
| `bun run docker:build` | Build Docker image |
| `bun run docker:run` | Run Docker container with proper mounts |
| `bun run docker:dev` | Start development environment with docker-compose |
| `bun run docker:stop` | Stop running Doku containers |

## 💡 Common Workflows

### 🔄 Daily Development
```bash
# Start development (single command)
bun run dev

# Access your app at:
# - http://localhost:3000 (React dev with hot reload)  
# - http://localhost:9090 (Python backend + API)
```

### 🧪 Before Committing
```bash
bun run lint              # Check code style
bun run typecheck         # Check TypeScript errors  
bun run build            # Ensure production build works
```

### 🚀 Production Deployment
```bash
# Local production testing
bun run start:prod

# Docker deployment  
bun run docker:build
bun run docker:run
```

### 🆕 Initial Setup
```bash
# Automated setup
./setup.sh               # Unix/Mac
# or
setup.bat                # Windows

# Manual setup
bun run setup
```

## 🌐 Access Points

| Environment | URL | Description |
|-------------|-----|-------------|
| **Development** | http://localhost:3000 | React dev server with hot reload |
| **Production** | http://localhost:9090 | Python server with built React app |
| **Classic UI** | http://localhost:9090/site | Original HTML templates |
| **API Documentation** | http://localhost:9090/docs | FastAPI auto-generated docs |

## 🐛 Troubleshooting

### Port Conflicts
The application expects these ports to be available:
- **3000**: React development server
- **9090**: Python backend server

### Common Issues
```bash
# If frontend dependencies are outdated
bun run clean
cd frontend && bun install

# If build fails
bun run clean  
bun run build

# If Docker containers are running
bun run docker:stop
```

### Script Failures
- **Python scripts fail**: Ensure Python 3.11+ is installed and in PATH
- **Bun scripts fail**: Ensure Bun is installed (https://bun.sh/)
- **Permission errors on Unix**: Make setup.sh executable with `chmod +x setup.sh`

## 📂 Project Structure
```
doku/                    # ← Run all bun scripts from here
├── package.json         # ← Main scripts are here
├── frontend/           
│   ├── package.json     # Frontend-specific scripts
│   └── src/            
├── app/                # Python backend
└── setup.sh/setup.bat  # Automated setup scripts
```

This structure ensures all main development commands are accessible from the project root, making the development experience more intuitive and consistent with modern full-stack project conventions.
