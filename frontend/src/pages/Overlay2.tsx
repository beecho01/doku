import { useQuery } from 'react-query'
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Alert
} from '@heroui/react'
import { Layers, HardDrive, Database } from 'lucide-react'
import { apiService } from '@/services/api'
import LayerBreakdown from '@/components/LayerBreakdown'
import type { Overlay2Data } from '@/types'

export default function Overlay2() {
  const { data: overlay2Data, isLoading, error } = useQuery<Overlay2Data>(
    'overlay2',
    apiService.getOverlay2,
    { refetchInterval: 30000 }
  )



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        color="danger"
        variant="flat"
        title="Error"
        description="Failed to load overlay2 data. Please try again."
      />
    )
  }

  if (!overlay2Data) {
    return (
      <Alert
        color="warning"
        variant="flat"
        title="No Data"
        description="No overlay2 data available."
      />
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
      </div>

      {/* Info Alert */}
      <Alert
        color="primary"
        variant="flat"
        description="Overlay2 is Docker's default storage driver, managing filesystem layers for containers and images. It uses copy-on-write to efficiently share layers between containers."
      />

      <LayerBreakdown data={overlay2Data.layerBreakdown || { total: 0, used: 0, categories: [] }} />

      {/* Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Storage Efficiency */}
        <Card className='dark:bg-blue-400/5'>
          <CardHeader className="px-6 py-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Storage Efficiency</h2>
            </div>
          </CardHeader>
          <CardBody className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Layer Sharing</span>
              <Chip size="sm" color="success" variant="flat">
                {overlay2Data.storageEfficiency?.layerSharing || 'N/A'}
              </Chip>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Deduplication</span>
              <span className="text-sm font-medium">
                {overlay2Data.storageEfficiency?.deduplication || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Compression Ratio</span>
              <span className="text-sm font-medium">
                {overlay2Data.storageEfficiency?.compressionRatio || 'N/A'}
              </span>
            </div>
          </CardBody>
        </Card>

        {/* Layer Distribution */}
        <Card className='dark:bg-blue-400/5'>
          <CardHeader className="px-6 py-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Layer Distribution</h2>
            </div>
          </CardHeader>
          <CardBody className="px-6 py-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Image Layers</span>
              <span className="text-sm font-medium">
                {overlay2Data.layerDistribution?.imageLayers || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Container Layers</span>
              <span className="text-sm font-medium">
                {overlay2Data.layerDistribution?.containerLayers || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Base OS Layers</span>
              <span className="text-sm font-medium">
                {overlay2Data.layerDistribution?.baseOsLayers || 'N/A'}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* System Information */}
      <Card className='dark:bg-blue-400/5'>
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
              <p className="font-medium">{overlay2Data.systemInfo?.storageDriver || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Backing Filesystem</p>
              <p className="font-medium">{overlay2Data.systemInfo?.backingFilesystem || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Docker Root Dir</p>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                {overlay2Data.systemInfo?.dockerRootDir || 'N/A'}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Supports d_type</p>
              <Chip size="sm" color={overlay2Data.systemInfo?.supportsDType ? "success" : "default"} variant="flat">
                {overlay2Data.systemInfo?.supportsDType ? "Yes" : "No"}
              </Chip>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Native Overlay Diff</p>
              <Chip size="sm" color={overlay2Data.systemInfo?.nativeOverlayDiff ? "success" : "default"} variant="flat">
                {overlay2Data.systemInfo?.nativeOverlayDiff ? "Yes" : "No"}
              </Chip>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">userxattr</p>
              <Chip size="sm" color={overlay2Data.systemInfo?.userxattr ? "success" : "default"} variant="flat">
                {overlay2Data.systemInfo?.userxattr ? "Enabled" : "Disabled"}
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
