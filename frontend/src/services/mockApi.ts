import type {
  DashboardData,
  ContainerInfo,
  ImageInfo,
  VolumeInfo,
  BuildCacheInfo,
  LogInfo,
  BindMountInfo
} from '../types'

// Mock data for development
const mockDashboardData: DashboardData = {
  docker_version: {
    version: "24.0.7",
    api_version: "1.43",
    platform: {
      name: "Docker Desktop 4.25.0 (128006)"
    }
  },
  disk_usage: {
    used_bytes: 45_000_000_000, // 45 GB
    available_bytes: 155_000_000_000, // 155 GB
    total_bytes: 200_000_000_000, // 200 GB
    used_percent: 22.5
  },
  scan_status: {
    is_scanning: false,
    last_scan_time: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    scan_duration: 12500 // 12.5 seconds
  },
  summary: {
    images: { count: 12, size: 15_500_000_000 }, // 15.5 GB
    containers: { count: 8, size: 8_200_000_000 }, // 8.2 GB
    volumes: { count: 15, size: 12_300_000_000 }, // 12.3 GB
    build_cache: { count: 25, size: 5_800_000_000 }, // 5.8 GB
    overlay2: { size: 2_100_000_000 }, // 2.1 GB
    logs: { size: 850_000_000 }, // 850 MB
    bind_mounts: { size: 250_000_000 } // 250 MB
  }
}

const mockContainers: ContainerInfo[] = [
  {
    id: "c1a2b3c4d5e6",
    name: "nginx-web",
    image: "nginx:latest",
    status: "running",
    created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    size: 1_200_000_000,
    ports: ["80:8080", "443:8443"]
  },
  {
    id: "f7g8h9i0j1k2",
    name: "postgres-db",
    image: "postgres:15",
    status: "running",
    created: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    size: 2_800_000_000,
    ports: ["5432:5432"]
  },
  {
    id: "l3m4n5o6p7q8",
    name: "redis-cache",
    image: "redis:7-alpine",
    status: "running",
    created: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    size: 450_000_000,
    ports: ["6379:6379"]
  }
]

const mockImages: ImageInfo[] = [
  {
    id: "sha256:abc123def456",
    repository: "nginx",
    tag: "latest",
    created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    size: 1_400_000_000,
    virtual_size: 1_400_000_000,
    containers: 1
  },
  {
    id: "sha256:ghi789jkl012",
    repository: "postgres",
    tag: "15",
    created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    size: 3_200_000_000,
    virtual_size: 3_200_000_000,
    containers: 1
  },
  {
    id: "sha256:mno345pqr678",
    repository: "redis",
    tag: "7-alpine",
    created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    size: 280_000_000,
    virtual_size: 280_000_000,
    containers: 1
  },
  {
    id: "sha256:def456ghi789",
    repository: "node",
    tag: "18-alpine",
    created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    size: 850_000_000,
    virtual_size: 850_000_000,
    containers: 2
  },
  {
    id: "sha256:jkl012mno345",
    repository: "python",
    tag: "3.11-slim",
    created: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    size: 650_000_000,
    virtual_size: 650_000_000,
    containers: 0
  },
  {
    id: "sha256:pqr678stu901",
    repository: "mongo",
    tag: "6.0",
    created: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    size: 2_100_000_000,
    virtual_size: 2_100_000_000,
    containers: 1
  },
  {
    id: "sha256:vwx234yzz567",
    repository: "alpine",
    tag: "3.18",
    created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    size: 45_000_000,
    virtual_size: 45_000_000,
    containers: 3
  },
  {
    id: "sha256:abc890def123",
    repository: "ubuntu",
    tag: "22.04",
    created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    size: 280_000_000,
    virtual_size: 280_000_000,
    containers: 0
  },
  {
    id: "sha256:ghi456jkl789",
    repository: "traefik",
    tag: "v3.0",
    created: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    size: 410_000_000,
    virtual_size: 410_000_000,
    containers: 1
  },
  {
    id: "sha256:mno012pqr345",
    repository: "mysql",
    tag: "8.0",
    created: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    size: 1_850_000_000,
    virtual_size: 1_850_000_000,
    containers: 0
  },
  {
    id: "sha256:stu678vwx901",
    repository: "elasticsearch",
    tag: "8.11.0",
    created: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    size: 3_800_000_000,
    virtual_size: 3_800_000_000,
    containers: 0
  },
  {
    id: "sha256:yza234bcd567",
    repository: "golang",
    tag: "1.21-alpine",
    created: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    size: 320_000_000,
    virtual_size: 320_000_000,
    containers: 0
  }
]

const mockVolumes: VolumeInfo[] = [
  {
    name: "postgres_data",
    driver: "local",
    created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    size: 8_500_000_000,
    mount_point: "/var/lib/docker/volumes/postgres_data/_data",
    containers: 1
  },
  {
    name: "nginx_config",
    driver: "local",
    created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    size: 125_000,
    mount_point: "/var/lib/docker/volumes/nginx_config/_data",
    containers: 1
  }
]

const mockBuildCache: BuildCacheInfo[] = [
  {
    id: "cache123abc",
    type: "regular",
    size: 2_100_000_000,
    created: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    usage_count: 15
  },
  {
    id: "cache456def",
    type: "inline",
    size: 850_000_000,
    created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    usage_count: 8
  }
]

const mockLogs: LogInfo[] = [
  {
    container_id: "c1a2b3c4d5e6",
    container_name: "nginx-web",
    log_path: "/var/lib/docker/containers/c1a2b3c4d5e6/c1a2b3c4d5e6-json.log",
    size: 45_000_000,
    created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "f7g8h9i0j1k2",
    container_name: "postgres-db",
    log_path: "/var/lib/docker/containers/f7g8h9i0j1k2/f7g8h9i0j1k2-json.log",
    size: 125_000_000,
    created: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "l3m4n5o6p7q8",
    container_name: "redis-cache",
    log_path: "/var/lib/docker/containers/l3m4n5o6p7q8/l3m4n5o6p7q8-json.log",
    size: 15_000_000,
    created: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "n9o0p1q2r3s4",
    container_name: "api-server",
    log_path: "/var/lib/docker/containers/n9o0p1q2r3s4/n9o0p1q2r3s4-json.log",
    size: 85_000_000,
    created: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "t5u6v7w8x9y0",
    container_name: "mongo-db",
    log_path: "/var/lib/docker/containers/t5u6v7w8x9y0/t5u6v7w8x9y0-json.log",
    size: 200_000_000,
    created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "z1a2b3c4d5e6",
    container_name: "frontend-dev",
    log_path: "/var/lib/docker/containers/z1a2b3c4d5e6/z1a2b3c4d5e6-json.log",
    size: 35_000_000,
    created: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "f7g8h9i0j1k3",
    container_name: "worker-queue",
    log_path: "/var/lib/docker/containers/f7g8h9i0j1k3/f7g8h9i0j1k3-json.log",
    size: 150_000_000,
    created: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "m5n6o7p8q9r0",
    container_name: "elasticsearch",
    log_path: "/var/lib/docker/containers/m5n6o7p8q9r0/m5n6o7p8q9r0-json.log",
    size: 500_000_000,
    created: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  }
]

const mockBindMounts: BindMountInfo[] = [
  {
    source: "/home/user/app",
    destination: "/app",
    container_name: "nginx-web",
    size: 125_000_000,
    type: "bind"
  },
  {
    source: "/home/user/data",
    destination: "/data",
    container_name: "postgres-db",
    size: 85_000_000,
    type: "bind"
  }
]

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApiService = {
  // Dashboard data
  getDashboard: async (): Promise<DashboardData> => {
    await delay(Math.random() * 1000 + 500) // 500-1500ms delay
    return mockDashboardData
  },

  // Containers
  getContainers: async (): Promise<ContainerInfo[]> => {
    await delay(Math.random() * 800 + 300)
    return mockContainers
  },

  // Images
  getImages: async (): Promise<ImageInfo[]> => {
    await delay(Math.random() * 800 + 300)
    return mockImages
  },

  // Volumes
  getVolumes: async (): Promise<VolumeInfo[]> => {
    await delay(Math.random() * 800 + 300)
    return mockVolumes
  },

  // Build cache
  getBuildCache: async (): Promise<BuildCacheInfo[]> => {
    await delay(Math.random() * 800 + 300)
    return mockBuildCache
  },

  // Container logs
  getLogs: async (): Promise<LogInfo[]> => {
    await delay(Math.random() * 800 + 300)
    return mockLogs
  },

  // Bind mounts
  getBindMounts: async (): Promise<BindMountInfo[]> => {
    await delay(Math.random() * 800 + 300)
    return mockBindMounts
  },

  // Overlay2 data
  getOverlay2: async (): Promise<any[]> => {
    await delay(Math.random() * 800 + 300)
    return []
  },

  // Trigger scan
  triggerScan: async (): Promise<void> => {
    await delay(2000) // Simulate scan operation
    mockDashboardData.scan_status.is_scanning = false
    mockDashboardData.scan_status.last_scan_time = new Date().toISOString()
    mockDashboardData.scan_status.scan_duration = Math.random() * 15000 + 5000
  },
}
