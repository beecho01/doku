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
import { Archive, RefreshCw, Search, Calendar, HardDrive, Activity, Layers } from 'lucide-react'
import { apiService } from '@/services/api'
import type { BuildCacheInfo } from '@/types'
import { useState, useMemo } from 'react'

export default function BuildCache() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'large' | 'frequent'>('all')

  const { data, isLoading, error, refetch, isFetching } = useQuery<BuildCacheInfo[]>(
    'build-cache',
    apiService.getBuildCache,
    { refetchInterval: 30000 }
  )

  const filteredCache = useMemo(() => {
    if (!data) return []

    let filtered = data.filter(cache =>
      cache.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cache.type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Apply filter
    if (activeFilter === 'recent') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      filtered = filtered.filter(cache => new Date(cache.last_used) > oneDayAgo)
    } else if (activeFilter === 'large') {
      filtered = filtered.filter(cache => cache.size > 1_000_000_000) // > 1GB
    } else if (activeFilter === 'frequent') {
      filtered = filtered.filter(cache => cache.usage_count > 10)
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
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Less than 1 hour ago'
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInDays === 1) return '1 day ago'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
    return `${Math.floor(diffInDays / 365)} years ago`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'primary'
      case 'inline': return 'secondary'
      case 'source.local': return 'success'
      default: return 'default'
    }
  }

  const getUsageColor = (count: number) => {
    if (count > 20) return 'success'
    if (count > 10) return 'primary'
    if (count > 5) return 'warning'
    return 'default'
  }

  const totalSize = useMemo(() => {
    if (!data) return 0
    return data.reduce((acc, cache) => acc + cache.size, 0)
  }, [data])

  const recentCache = useMemo(() => {
    if (!data) return 0
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return data.filter(cache => new Date(cache.last_used) > oneDayAgo).length
  }, [data])

  const largeCache = useMemo(() => {
    if (!data) return 0
    return data.filter(cache => cache.size > 1_000_000_000).length
  }, [data])

  const frequentCache = useMemo(() => {
    if (!data) return 0
    return data.filter(cache => cache.usage_count > 10).length
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
          <p className="text-red-600 dark:text-red-400">Failed to load build cache data. Please try again.</p>
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
            Build Cache
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Monitor and manage Docker build cache layers
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
              <Archive className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Total</p>
            </div>
            <p className="text-lg font-bold">{data.length}</p>
          </CardBody>
        </Card>

        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'recent' ? 'ring-2 ring-green-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('recent')}
        >
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Calendar className="w-3 h-3 text-green-600 dark:text-green-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Recent</p>
            </div>
            <p className="text-lg font-bold">{recentCache}</p>
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
            <p className="text-lg font-bold">{largeCache}</p>
          </CardBody>
        </Card>

        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'frequent' ? 'ring-2 ring-purple-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('frequent')}
        >
          <CardBody className="p-3 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <Activity className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Active</p>
            </div>
            <p className="text-lg font-bold">{frequentCache}</p>
          </CardBody>
        </Card>
      </div>

      {/* Build Cache Table */}
      <Card className='p-4'>
        <CardHeader className="p-0 pb-4 m-0 w-full flex">
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <Input
              placeholder="Search cache..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="max-w-xs"
              variant="flat"
            />
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredCache.length} of {data.length} cache entries
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <Table aria-label="Build Cache table" removeWrapper>
            <TableHeader>
              <TableColumn>CACHE ID</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>SIZE</TableColumn>
              <TableColumn>USAGE COUNT</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>LAST USED</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredCache.map((cache) => (
                <TableRow key={cache.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-500" />
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                        {cache.id.substring(0, 12)}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color={getTypeColor(cache.type)}>
                      {cache.type}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatSize(cache.size)}</div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getUsageColor(cache.usage_count)}
                      startContent={<Activity className="w-3 h-3" />}
                    >
                      {cache.usage_count}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(cache.created)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(cache.last_used)}
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
