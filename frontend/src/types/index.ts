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

export interface BuildCacheInfo {
  id: string
  type: string
  size: number
  created: string
  last_used: string
  usage_count: number
}

export interface LogInfo {
  container_id: string
  container_name: string
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

export interface DashboardData {
  docker_version: DockerVersion
  disk_usage: DiskUsage
  scan_status: ScanStatus
  summary: {
    images: { count: number; size: number }
    containers: { count: number; size: number }
    volumes: { count: number; size: number }
    build_cache: { count: number; size: number }
    overlay2: { count: number; size: number }
    logs: { count: number; size: number }
    bind_mounts: { count: number; size: number }
  }
}
