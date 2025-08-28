import type {
  DashboardData,
  ContainerInfo,
  ImageInfo,
  VolumeInfo,
  CacheInfo,
  BuildCacheInfo,
  LogInfo,
  BindMountInfo,
  Overlay2Data
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
    images: { count: 12, size: 15_285_000_000 }, // 15.3 GB (calculated from 12 images)
    containers: { count: 3, size: 4_450_000_000 }, // 4.5 GB (calculated from 3 containers)
    volumes: { count: 8, size: 49_075_125_000 }, // 49.1 GB (calculated from 8 volumes)
    cache: { count: 6, size: 8_450_000_000 }, // 8.5 GB (calculated from 6 cache entries)
    overlay2: { size: 2_100_000_000 }, // 2.1 GB (156 total storage layers)
    logs: { size: 1_155_000_000 }, // 1.2 GB (calculated from 8 log entries)
    bind_mounts: { size: 3_225_000_000 } // 3.2 GB (calculated from 7 bind mounts)
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
  },
  {
    name: "mongo_data",
    driver: "local",
    created: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    size: 12_800_000_000,
    mount_point: "/var/lib/docker/volumes/mongo_data/_data",
    containers: 1
  },
  {
    name: "redis_data",
    driver: "local",
    created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    size: 250_000_000,
    mount_point: "/var/lib/docker/volumes/redis_data/_data",
    containers: 1
  },
  {
    name: "app_uploads",
    driver: "local",
    created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    size: 3_200_000_000,
    mount_point: "/var/lib/docker/volumes/app_uploads/_data",
    containers: 2
  },
  {
    name: "elasticsearch_data",
    driver: "local",
    created: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    size: 18_500_000_000,
    mount_point: "/var/lib/docker/volumes/elasticsearch_data/_data",
    containers: 0
  },
  {
    name: "backup_storage",
    driver: "local",
    created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    size: 5_100_000_000,
    mount_point: "/var/lib/docker/volumes/backup_storage/_data",
    containers: 0
  },
  {
    name: "shared_cache",
    driver: "local",
    created: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    size: 850_000_000,
    mount_point: "/var/lib/docker/volumes/shared_cache/_data",
    containers: 3
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
  },
  {
    id: "cache789ghi",
    type: "regular",
    size: 1_200_000_000,
    created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    usage_count: 22
  },
  {
    id: "cache012jkl",
    type: "source.local",
    size: 650_000_000,
    created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    usage_count: 5
  },
  {
    id: "cache345mno",
    type: "inline",
    size: 3_200_000_000,
    created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    usage_count: 18
  },
  {
    id: "cache678pqr",
    type: "regular",
    size: 450_000_000,
    created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    usage_count: 3
  }
]

const mockLogs: LogInfo[] = [
  {
    container_id: "c1a2b3c4d5e6",
    container_name: "nginx-web",
    image: "nginx:latest",
    log_path: "/var/lib/docker/containers/c1a2b3c4d5e6/c1a2b3c4d5e6-json.log",
    size: 45_000_000,
    created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "f7g8h9i0j1k2",
    container_name: "postgres-db",
    image: "postgres:13",
    log_path: "/var/lib/docker/containers/f7g8h9i0j1k2/f7g8h9i0j1k2-json.log",
    size: 125_000_000,
    created: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "l3m4n5o6p7q8",
    container_name: "redis-cache",
    image: "redis:7-alpine",
    log_path: "/var/lib/docker/containers/l3m4n5o6p7q8/l3m4n5o6p7q8-json.log",
    size: 15_000_000,
    created: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "n9o0p1q2r3s4",
    container_name: "api-server",
    image: "node:18-alpine",
    log_path: "/var/lib/docker/containers/n9o0p1q2r3s4/n9o0p1q2r3s4-json.log",
    size: 85_000_000,
    created: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "t5u6v7w8x9y0",
    container_name: "mongo-db",
    image: "mongo:5.0",
    log_path: "/var/lib/docker/containers/t5u6v7w8x9y0/t5u6v7w8x9y0-json.log",
    size: 200_000_000,
    created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "z1a2b3c4d5e6",
    container_name: "frontend-dev",
    image: "node:16",
    log_path: "/var/lib/docker/containers/z1a2b3c4d5e6/z1a2b3c4d5e6-json.log",
    size: 35_000_000,
    created: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "f7g8h9i0j1k3",
    container_name: "worker-queue",
    image: "python:3.9-slim",
    log_path: "/var/lib/docker/containers/f7g8h9i0j1k3/f7g8h9i0j1k3-json.log",
    size: 150_000_000,
    created: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    container_id: "m5n6o7p8q9r0",
    container_name: "elasticsearch",
    image: "elasticsearch:8.5.0",
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
  },
  {
    source: "/home/user/config",
    destination: "/etc/config",
    container_name: "api-server",
    size: 45_000_000,
    type: "bind"
  },
  {
    source: "/var/log/app",
    destination: "/logs",
    container_name: "frontend-dev",
    size: 200_000_000,
    type: "bind"
  },
  {
    source: "/home/user/uploads",
    destination: "/uploads",
    container_name: "mongo-db",
    size: 1_800_000_000,
    type: "bind"
  },
  {
    source: "/tmp/cache",
    destination: "/cache",
    container_name: "redis-cache",
    size: 320_000_000,
    type: "bind"
  },
  {
    source: "/home/user/workspace",
    destination: "/workspace",
    container_name: "worker-queue",
    size: 650_000_000,
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

  // Cache (alias for build cache)
  getCache: async (): Promise<CacheInfo[]> => {
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
  getOverlay2: async (): Promise<Overlay2Data> => {
    await delay(Math.random() * 800 + 300)
    return {
      layerBreakdown: {
        total: 100,
        used: 75,
        categories: [
          { name: "Base Images", size: 25, color: "primary" },
          { name: "Application Layers", size: 30, color: "secondary" },
          { name: "Data Layers", size: 20, color: "success" }
        ]
      },
      storageEfficiency: {
        layerSharing: "85%",
        deduplication: "3.2x",
        compressionRatio: "1.8x"
      },
      layerDistribution: {
        imageLayers: 45,
        containerLayers: 32,
        baseOsLayers: 12
      },
      systemInfo: {
        storageDriver: "overlay2",
        backingFilesystem: "ext4",
        dockerRootDir: "/var/lib/docker",
        supportsDType: true,
        nativeOverlayDiff: true,
        userxattr: false
      }
    }
  },

  // Trigger scan
  triggerScan: async (): Promise<void> => {
    await delay(2000) // Simulate scan operation
    mockDashboardData.scan_status.is_scanning = false
    mockDashboardData.scan_status.last_scan_time = new Date().toISOString()
    mockDashboardData.scan_status.scan_duration = Math.random() * 15000 + 5000
  },

  // Container logs (real-time from Docker API)
  getContainerLogs: async (containerId: string, lines: number = 100): Promise<any> => {
    await delay(Math.random() * 1000 + 500)

    // Generate mock log data
    const mockLogs = Array.from({ length: Math.min(lines, 50) }, (_, i) => {
      const timestamp = new Date(Date.now() - (lines - i) * 60000).toISOString()
      return `${timestamp} container ${containerId} Log entry ${i + 1}: This is a mock log message`
    }).join('\n')

    return {
      container_id: containerId,
      container_name: `mock-container-${containerId.substring(0, 12)}`,
      logs: mockLogs,
      lines_requested: lines,
      timestamp: new Date().toISOString()
    }
  },

  // System information
  getSystemInfo: async (): Promise<any> => {
    await delay(Math.random() * 800 + 300)
    return {
      ID: "mock-docker-id",
      Containers: 8,
      ContainersRunning: 5,
      ContainersPaused: 0,
      ContainersStopped: 3,
      Images: 12,
      Driver: "overlay2",
      DriverStatus: [["Backing Filesystem", "extfs"]],
      DockerRootDir: "/var/lib/docker",
      Plugins: {
        Volume: ["local"],
        Network: ["bridge", "host", "overlay", "macvlan", "null", "ipvlan"]
      },
      MemoryLimit: true,
      SwapLimit: true,
      KernelMemory: true,
      CpuCfsPeriod: true,
      CpuCfsQuota: true,
      CPUShares: true,
      CPUSet: true,
      PidsLimit: true,
      OomKillDisable: true,
      IPv4Forwarding: true,
      BridgeNfIptables: true,
      BridgeNfIp6tables: true,
      Debug: false,
      NFd: 24,
      NGoroutines: 35,
      SystemTime: new Date().toISOString(),
      LoggingDriver: "json-file",
      CgroupDriver: "cgroupfs",
      NEventsListener: 0,
      KernelVersion: "5.15.0-91-generic",
      OperatingSystem: "Ubuntu 22.04.3 LTS",
      OSType: "linux",
      Architecture: "x86_64",
      NCPU: 4,
      MemTotal: 8_589_934_592, // 8GB
      GenericResources: null,
      HttpProxy: "",
      HttpsProxy: "",
      NoProxy: "",
      Name: "mock-docker-host",
      Labels: [],
      ExperimentalBuild: false,
      ServerVersion: "24.0.7",
      Runtimes: {
        "runc": {
          path: "runc"
        },
        "io.containerd.runc.v2": {
          path: "runc"
        },
        "io.containerd.runtime.v1.linux": {
          path: "runc"
        }
      },
      DefaultRuntime: "runc",
      Swarm: {
        LocalNodeState: "inactive"
      },
      LiveRestoreEnabled: false,
      Isolation: "",
      InitBinary: "docker-init",
      ContainerdCommit: {
        ID: "mock-containerd-commit",
        Expected: "mock-containerd-commit"
      },
      RuncCommit: {
        ID: "mock-runc-commit",
        Expected: "mock-runc-commit"
      },
      InitCommit: {
        ID: "mock-init-commit",
        Expected: "mock-init-commit"
      },
      SecurityOptions: ["name=seccomp,profile=default"],
      ProductLicense: "Community Engine",
      DefaultAddressPools: [
        {
          Base: "172.17.0.0/12",
          Size: 16
        }
      ],
      Warnings: []
    }
  },

  // Docker daemon ping
  pingDocker: async (): Promise<any> => {
    await delay(Math.random() * 200 + 100)
    return {
      status: "ok",
      message: "Docker daemon is responding"
    }
  },

  // Docker authentication check
  checkAuth: async (): Promise<any> => {
    await delay(Math.random() * 300 + 200)
    return {
      Status: "Login Succeeded"
    }
  },

  // Docker events
  getEvents: async (): Promise<any[]> => {
    await delay(Math.random() * 800 + 300)

    const events: any[] = []
    const eventTypes = ['container', 'image', 'volume', 'network']
    const actions = ['create', 'start', 'stop', 'destroy', 'pull', 'push']

    for (let i = 0; i < 20; i++) {
      events.push({
        Type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        Action: actions[Math.floor(Math.random() * actions.length)],
        Actor: {
          ID: `mock-id-${i}`,
          Attributes: {
            name: `mock-resource-${i}`,
            image: `mock-image-${i}:latest`
          }
        },
        time: Math.floor(Date.now() / 1000) - (i * 60),
        timeNano: (Math.floor(Date.now() / 1000) - (i * 60)) * 1_000_000_000
      })
    }

    return events
  }
}
