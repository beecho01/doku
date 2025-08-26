import { useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Input,
  Spinner,
  Button
} from '@heroui/react'
import { Container, Search, RefreshCw, Database, Activity, Clock, HardDrive } from 'lucide-react'
import { apiService } from '@/services/api'
import type { ContainerInfo } from '@/types'

export default function Containers() {
  const [searchValue, setSearchValue] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'stopped'>('all')

  const { data: containers, isLoading, error, refetch, isFetching } = useQuery<ContainerInfo[]>(
    'containers',
    apiService.getContainers,
    { refetchInterval: 30000 }
  )

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredContainers = useMemo(() => {
    if (!containers) return []

    return containers.filter(container => {
      const matchesSearch = container.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                           container.image.toLowerCase().includes(searchValue.toLowerCase())
      const matchesStatus = statusFilter === 'all' || container.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [containers, searchValue, statusFilter])

  const summary = useMemo(() => {
    if (!containers) return { total: 0, running: 0, stopped: 0, totalSize: 0 }

    return containers.reduce((acc, container) => {
      acc.total++
      acc.totalSize += container.size
      if (container.status === 'running') acc.running++
      else acc.stopped++
      return acc
    }, { total: 0, running: 0, stopped: 0, totalSize: 0 })
  }, [containers])

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
          <p className="text-red-600 dark:text-red-400">Failed to load containers. Please try again.</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Docker Containers
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor your Docker containers
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="aspect-square cursor-pointer hover:scale-105 transition-transform"
          isPressable
          onPress={() => setStatusFilter('all')}
        >
          <CardBody className="p-3 bg-blue-500/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Container className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total containers</p>
            </div>
            <p className="text-lg font-bold">{summary.total}</p>
          </CardBody>
        </Card>

        <Card
          className="aspect-square cursor-pointer hover:scale-105 transition-transform"
          isPressable
          onPress={() => setStatusFilter('running')}
        >
          <CardBody className="p-3 bg-green-500/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Activity className="w-3 h-3 text-green-600 dark:text-green-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Running</p>
            </div>
            <p className="text-lg font-bold">{summary.running}</p>
          </CardBody>
        </Card>

        <Card
          className="aspect-square cursor-pointer hover:scale-105 transition-transform"
          isPressable
          onPress={() => setStatusFilter('stopped')}
        >
          <CardBody className="p-3 bg-gray-500/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Stopped</p>
            </div>
            <p className="text-lg font-bold">{summary.stopped}</p>
          </CardBody>
        </Card>

        <Card className="aspect-square">
          <CardBody className="p-3 bg-purple-500/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <HardDrive className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total Size</p>
            </div>
            <p className="text-lg font-bold">{formatBytes(summary.totalSize)}</p>
          </CardBody>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          isClearable
          className="w-full sm:max-w-xs"
          placeholder="Search containers..."
          startContent={<Search className="w-4 h-4" />}
          value={searchValue}
          onValueChange={setSearchValue}
        />

        <div className="flex justify-between sm:justify-end">
          <p className="text-sm text-gray-500 flex items-center">
            Containers shown: {filteredContainers.length}
          </p>
        </div>
      </div>

      {/* Containers Table */}
      <Card>
        <Table aria-label="Containers table" className="min-h-[400px]">
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>IMAGE</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>CREATED</TableColumn>
            <TableColumn>SIZE</TableColumn>
            <TableColumn>PORTS</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No containers found">
            {filteredContainers.map((container) => (
              <TableRow key={container.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Container className="w-4 h-4 text-gray-400" />
                    <span className="font-mono text-sm">{container.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {container.image}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    color={container.status === 'running' ? 'success' : 'default'}
                    size="sm"
                    variant="flat"
                  >
                    {container.status}
                  </Chip>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(container.created)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">
                    {formatBytes(container.size)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {container.ports.map((port, index) => (
                      <Chip key={index} size="sm" variant="flat" color="primary">
                        {port}
                      </Chip>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
