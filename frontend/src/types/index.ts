export interface DockerVersion {
  version: string
  api_version: string
  platform: {
    name: string
  }
}

export interface DiskUsage {
  used_bytes: number
  available_bytes: number
  total_bytes: number
  used_percent: number
}

export interface ContainerInfo {
  id: string
  name: string
  image: string
  status: string
  created: string
  size: number
  ports: string[]
}

export interface ImageInfo {
  id: string
  repository: string
  tag: string
  created: string
  size: number
  virtual_size: number
  containers: number
}

export interface VolumeInfo {
  name: string
  driver: string
  created: string
  size: number
  mount_point: string
  containers: number
}

export interface CacheInfo {
  id: string
  type: string
  size: number
  created: string
  last_used: string
  usage_count: number
}

export interface BuildCacheInfo extends CacheInfo {}

export interface LogInfo {
  container_id: string
  container_name: string
  image: string
  log_path: string
  size: number
  created: string
}

export interface BindMountInfo {
  source: string
  destination: string
  container_name: string
  size: number
  type: string
}

export interface ScanStatus {
  is_scanning: boolean
  last_scan_time?: string
  scan_duration?: number
}

export interface DockerSystemInfo {
  ID: string
  Containers: number
  ContainersRunning: number
  ContainersPaused: number
  ContainersStopped: number
  Images: number
  Driver: string
  DriverStatus: Array<Array<string>>
  DockerRootDir: string
  Plugins: {
    Volume: string[]
    Network: string[]
    Authorization?: string[]
    Log?: string[]
  }
  MemoryLimit: boolean
  SwapLimit: boolean
  KernelMemory: boolean
  CpuCfsPeriod: boolean
  CpuCfsQuota: boolean
  CPUShares: boolean
  CPUSet: boolean
  PidsLimit: boolean
  OomKillDisable: boolean
  IPv4Forwarding: boolean
  BridgeNfIptables: boolean
  BridgeNfIp6tables: boolean
  Debug: boolean
  NFd: number
  NGoroutines: number
  SystemTime: string
  LoggingDriver: string
  CgroupDriver: string
  NEventsListener: number
  KernelVersion: string
  OperatingSystem: string
  OSType: string
  Architecture: string
  NCPU: number
  MemTotal: number
  GenericResources?: any
  DockerSwarm?: {
    NodeID: string
    NodeAddr: string
    LocalNodeState: string
    ControlAvailable: boolean
    Error: string
    RemoteManagers?: Array<{
      NodeID: string
      Addr: string
    }>
  }
  HttpProxy: string
  HttpsProxy: string
  NoProxy: string
  Name: string
  Labels: string[]
  ExperimentalBuild: boolean
  ServerVersion: string
  Runtimes: Record<string, any>
  DefaultRuntime: string
  Swarm: {
    LocalNodeState: string
    [key: string]: any
  }
  LiveRestoreEnabled: boolean
  Isolation: string
  InitBinary: string
  ContainerdCommit: {
    ID: string
    Expected: string
  }
  RuncCommit: {
    ID: string
    Expected: string
  }
  InitCommit: {
    ID: string
    Expected: string
  }
  SecurityOptions: string[]
  ProductLicense: string
  DefaultAddressPools: Array<{
    Base: string
    Size: number
  }>
  Warnings: string[]
}

export interface DockerEvent {
  Type: string
  Action: string
  Actor: {
    ID: string
    Attributes: Record<string, string>
  }
  time: number
  timeNano: number
}

export interface ContainerLogs {
  container_id: string
  container_name: string
  logs: string
  lines_requested: number
  timestamp: string
}

export interface PingResponse {
  status: string
  message: string
}

export interface Overlay2Data {
  layerBreakdown: {
    total: number
    used: number
    categories: Array<{
      name: string
      size: number
      color: "primary" | "secondary" | "success" | "warning" | "danger" | "default"
    }>
  }
  storageEfficiency: {
    layerSharing: string
    deduplication: string
    compressionRatio: string
  }
  layerDistribution: {
    imageLayers: number
    containerLayers: number
    baseOsLayers: number
  }
  systemInfo: {
    storageDriver: string
    backingFilesystem: string
    dockerRootDir: string
    supportsDType: boolean
    nativeOverlayDiff: boolean
    userxattr: boolean
  }
}

export interface DashboardData {
  docker_version: DockerVersion
  disk_usage: DiskUsage
  scan_status: ScanStatus
  summary: {
    images: { count: number; size: number }
    containers: { count: number; size: number }
    volumes: { count: number; size: number }
    cache: { count: number; size: number }
    overlay2: { size: number }
    logs: { size: number }
    bind_mounts: { size: number }
  }
}
