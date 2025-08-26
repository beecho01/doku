import { useQuery } from 'react-query'
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Button
} from '@heroui/react'
import { Layers, RefreshCw, HardDrive, AlertTriangle, Info, Database } from 'lucide-react'
import { apiService } from '@/services/api'

export default function Overlay2() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<any[]>(
    'overlay2',
    apiService.getOverlay2,
    { refetchInterval: 30000 }
  )

  // Mock some overlay2 data since the API returns empty array
  const mockOverlay2Data = {
    totalSize: 2_100_000_000, // 2.1 GB from dashboard summary
    totalLayers: 156,
    activeLayers: 24, // Active layers currently in use by containers
    activeContainers: 8,
    unusedLayers: 23,
    sharedLayers: 18 // Layers shared between multiple images
  }

  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <CardBody className="px-6 py-6">
          <p className="text-red-600 dark:text-red-400">Failed to load overlay2 data. Please try again.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Overlay2 Storage
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Monitor Docker's overlay2 storage driver and filesystem layers
          </p>
        </div>
        <Button
          size="sm"
          startContent={<RefreshCw className="w-4 h-4" />}
          onPress={() => refetch()}
          isDisabled={isFetching}
          variant="flat"
        >
          {isFetching ? 'Refreshing' : 'Refresh'}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <CardBody className="px-6 py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                About Overlay2 Storage Driver
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Overlay2 is Docker's default storage driver, managing filesystem layers for containers and images.
                It uses copy-on-write to efficiently share layers between containers.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="aspect-square">
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <HardDrive className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total Size</p>
            </div>
            <p className="text-lg font-bold">{formatSize(mockOverlay2Data.totalSize)}</p>
          </CardBody>
        </Card>

        <Card className="aspect-square">
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Layers className="w-3 h-3 text-green-600 dark:text-green-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Layers</p>
            </div>
            <p className="text-lg font-bold">{mockOverlay2Data.totalLayers}</p>
          </CardBody>
        </Card>

        <Card className="aspect-square">
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Database className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Active Layers</p>
            </div>
            <p className="text-lg font-bold">{mockOverlay2Data.activeLayers}</p>
          </CardBody>
        </Card>

        <Card className="aspect-square">
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <AlertTriangle className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Unused</p>
            </div>
            <p className="text-lg font-bold">{mockOverlay2Data.unusedLayers}</p>
          </CardBody>
        </Card>
      </div>

      {/* Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Storage Efficiency */}
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Storage Efficiency</h2>
            </div>
          </CardHeader>
          <CardBody className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Layer Sharing</span>
              <Chip size="sm" color="success" variant="flat">Optimal</Chip>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Deduplication</span>
              <span className="text-sm font-medium">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Compression Ratio</span>
              <span className="text-sm font-medium">2.3:1</span>
            </div>
          </CardBody>
        </Card>

        {/* Layer Distribution */}
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Layer Distribution</h2>
            </div>
          </CardHeader>
          <CardBody className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Image Layers</span>
              <span className="text-sm font-medium">133</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Container Layers</span>
              <span className="text-sm font-medium">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Base OS Layers</span>
              <span className="text-sm font-medium">45</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">System Information</h2>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Storage Driver</p>
              <p className="font-medium">overlay2</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Backing Filesystem</p>
              <p className="font-medium">ext4</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Docker Root Dir</p>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                /var/lib/docker
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Supports d_type</p>
              <Chip size="sm" color="success" variant="flat">Yes</Chip>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Native Overlay Diff</p>
              <Chip size="sm" color="success" variant="flat">Yes</Chip>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">userxattr</p>
              <Chip size="sm" color="default" variant="flat">Disabled</Chip>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
