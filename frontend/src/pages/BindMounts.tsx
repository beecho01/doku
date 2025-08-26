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
import { Link, RefreshCw, Search, Container, FolderOpen, HardDrive, ArrowRight } from 'lucide-react'
import { apiService } from '@/services/api'
import type { BindMountInfo } from '@/types'
import { useState, useMemo } from 'react'

export default function BindMounts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'large' | 'containers'>('all')

  const { data, isLoading, error, refetch, isFetching } = useQuery<BindMountInfo[]>(
    'bind-mounts',
    apiService.getBindMounts,
    { refetchInterval: 30000 }
  )

  const filteredMounts = useMemo(() => {
    if (!data) return []

    let filtered = data.filter(mount =>
      mount.container_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mount.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mount.destination.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Apply filter
    if (activeFilter === 'large') {
      filtered = filtered.filter(mount => mount.size > 500_000_000) // > 500MB
    }

    return filtered.sort((a, b) => b.size - a.size)
  }, [data, searchQuery, activeFilter])

  const formatSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const truncatePath = (path: string, maxLength: number = 30) => {
    if (path.length <= maxLength) return path
    return `...${path.slice(-(maxLength - 3))}`
  }

  const totalSize = useMemo(() => {
    if (!data) return 0
    return data.reduce((acc, mount) => acc + mount.size, 0)
  }, [data])

  const largeMounts = useMemo(() => {
    if (!data) return 0
    return data.filter(mount => mount.size > 500_000_000).length
  }, [data])

  const uniqueContainers = useMemo(() => {
    if (!data) return 0
    const containers = new Set(data.map(mount => mount.container_name))
    return containers.size
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
          <p className="text-red-600 dark:text-red-400">Failed to load bind mounts data. Please try again.</p>
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
            Bind Mounts
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor Docker bind mounts
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
              <Link className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total</p>
            </div>
            <p className="text-lg font-bold">{data.length}</p>
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
            <p className="text-lg font-bold">{largeMounts}</p>
          </CardBody>
        </Card>

        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'containers' ? 'ring-2 ring-green-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('containers')}
        >
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Container className="w-3 h-3 text-green-600 dark:text-green-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Apps</p>
            </div>
            <p className="text-lg font-bold">{uniqueContainers}</p>
          </CardBody>
        </Card>

        <Card className="aspect-square">
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <HardDrive className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Size</p>
            </div>
            <p className="text-sm font-bold">{formatSize(totalSize)}</p>
          </CardBody>
        </Card>
      </div>

      {/* Bind Mounts Table */}
      <Card className='p-4'>
        <CardHeader className="p-0 pb-4 m-0 w-full flex">
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <Input
              placeholder="Search bind mounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="max-w-xs"
              variant="flat"
            />
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredMounts.length} of {data.length} bind mounts
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <Table aria-label="Bind Mounts table" removeWrapper>
            <TableHeader>
              <TableColumn>CONTAINER</TableColumn>
              <TableColumn>SOURCE PATH</TableColumn>
              <TableColumn>DESTINATION</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>SIZE</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredMounts.map((mount, index) => (
                <TableRow key={`${mount.container_name}-${mount.source}-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Container className="w-4 h-4 text-blue-500" />
                      <div className="font-medium">{mount.container_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-3 h-3 text-gray-400" />
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                        {truncatePath(mount.source)}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                        {mount.destination}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      {mount.type}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatSize(mount.size)}</div>
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
