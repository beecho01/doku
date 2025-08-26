import { useQuery } from 'react-query'
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input
} from '@heroui/react'
import { Database, RefreshCw, Search, Container, Calendar, HardDrive, FolderOpen } from 'lucide-react'
import { apiService } from '@/services/api'
import type { VolumeInfo } from '@/types'
import { useState, useMemo } from 'react'

export default function Volumes() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-use' | 'unused' | 'large'>('all')

  const { data, isLoading, error, refetch, isFetching } = useQuery<VolumeInfo[]>(
    'volumes',
    apiService.getVolumes,
    { refetchInterval: 30000 }
  )

  const filteredVolumes = useMemo(() => {
    if (!data) return []

    let filtered = data.filter(volume =>
      volume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volume.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volume.mount_point.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Apply filter
    if (activeFilter === 'in-use') {
      filtered = filtered.filter(volume => volume.containers > 0)
    } else if (activeFilter === 'unused') {
      filtered = filtered.filter(volume => volume.containers === 0)
    } else if (activeFilter === 'large') {
      filtered = filtered.filter(volume => volume.size > 5_000_000_000) // > 5GB
    }

    return filtered.sort((a, b) => b.size - a.size)
  }, [data, searchQuery, activeFilter])

  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const getContainerStatusColor = (containerCount: number) => {
    if (containerCount === 0) return 'default'
    if (containerCount === 1) return 'success'
    return 'primary'
  }

  const totalSize = useMemo(() => {
    if (!data) return 0
    return data.reduce((acc, volume) => acc + volume.size, 0)
  }, [data])

  const inUseVolumes = useMemo(() => {
    if (!data) return 0
    return data.filter(volume => volume.containers > 0).length
  }, [data])

  const unusedVolumes = useMemo(() => {
    if (!data) return 0
    return data.filter(volume => volume.containers === 0).length
  }, [data])

  const largeVolumes = useMemo(() => {
    if (!data) return 0
    return data.filter(volume => volume.size > 5_000_000_000).length
  }, [data])

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
          <p className="text-red-600 dark:text-red-400">Failed to load volumes data. Please try again.</p>
        </CardBody>
      </Card>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Docker Volumes
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor your Docker volumes
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

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'all' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('all')}
        >
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Database className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total</p>
            </div>
            <p className="text-lg font-bold">{data.length}</p>
          </CardBody>
        </Card>

        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'in-use' ? 'ring-2 ring-green-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('in-use')}
        >
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Container className="w-3 h-3 text-green-600 dark:text-green-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">In Use</p>
            </div>
            <p className="text-lg font-bold">{inUseVolumes}</p>
          </CardBody>
        </Card>

        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'unused' ? 'ring-2 ring-red-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('unused')}
        >
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Database className="w-3 h-3 text-red-600 dark:text-red-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Unused</p>
            </div>
            <p className="text-lg font-bold">{unusedVolumes}</p>
          </CardBody>
        </Card>

        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'large' ? 'ring-2 ring-orange-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('large')}
        >
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <HardDrive className="w-3 h-3 text-orange-600 dark:text-orange-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Large</p>
            </div>
            <p className="text-lg font-bold">{largeVolumes}</p>
          </CardBody>
        </Card>
      </div>

      {/* Volumes Table */}
      <Card className='p-4'>
        <CardHeader className="p-0 pb-4 m-0 w-full flex">
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <Input
              placeholder="Search volumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="max-w-xs"
              variant="flat"
            />
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredVolumes.length} of {data.length} volumes
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <Table aria-label="Docker Volumes table" removeWrapper>
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>DRIVER</TableColumn>
              <TableColumn>SIZE</TableColumn>
              <TableColumn>CONTAINERS</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>MOUNT POINT</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredVolumes.map((volume) => (
                <TableRow key={volume.name}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-500" />
                      <div className="font-medium">{volume.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="default">
                      {volume.driver}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatSize(volume.size)}</div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getContainerStatusColor(volume.containers)}
                      startContent={<Container className="w-3 h-3" />}
                    >
                      {volume.containers === 0 ? 'Unused' : `${volume.containers} container${volume.containers > 1 ? 's' : ''}`}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(volume.created)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-3 h-3 text-gray-400" />
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono max-w-xs truncate">
                        {volume.mount_point}
                      </code>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}

export { default as BuildCache } from './BuildCache'
export { default as Overlay2 } from './Overlay2'
export { default as Logs } from './Logs'
export { default as BindMounts } from './BindMounts'
