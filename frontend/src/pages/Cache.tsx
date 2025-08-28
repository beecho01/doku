import { useQuery } from 'react-query'
import {
  Card,
  CardBody,
  Chip,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Tabs,
  Tab,
} from '@heroui/react'
import { Search, Activity } from 'lucide-react'
import { apiService } from '@/services/api'
import type { CacheInfo } from '@/types'
import { useState, useMemo } from 'react'

export default function Cache() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'recent' | 'large' | 'frequent'>('all')
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: "ascending" | "descending";
  }>({ column: "", direction: "ascending" });

  const { data, isLoading, error } = useQuery<CacheInfo[]>(
    'build-cache',
    apiService.getCache,
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

    // Apply sorting
    if (sortDescriptor.column) {
      filtered = filtered.sort((a: CacheInfo, b: CacheInfo) => {
        let aValue: any;
        let bValue: any;

        switch (sortDescriptor.column) {
          case "id":
            aValue = a.id.toLowerCase();
            bValue = b.id.toLowerCase();
            break;
          case "type":
            aValue = a.type.toLowerCase();
            bValue = b.type.toLowerCase();
            break;
          case "size":
            aValue = a.size;
            bValue = b.size;
            break;
          case "usage_count":
            aValue = a.usage_count;
            bValue = b.usage_count;
            break;
          case "created":
            aValue = new Date(a.created).getTime();
            bValue = new Date(b.created).getTime();
            break;
          case "last_used":
            aValue = new Date(a.last_used).getTime();
            bValue = new Date(b.last_used).getTime();
            break;
          default:
            return 0;
        }

        if (sortDescriptor.direction === "ascending") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    } else {
      // Default sort by size descending
      filtered = filtered.sort((a, b) => b.size - a.size);
    }

    return filtered
  }, [data, searchQuery, activeFilter, sortDescriptor])

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

  const recentCache = useMemo(() => {
    if (!data) return 0
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return data.filter(cache => new Date(cache.last_used) > oneDayAgo).length
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

  if (!data) return null

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Cache
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Monitor and manage Docker cache layers
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs
          aria-label="Filter Options"
          selectedKey={activeFilter}
          onSelectionChange={(key) => setActiveFilter(key as "all" | "recent" | "large" | "frequent")}
          variant="solid"
          color="primary"
          radius="full"
          className="md:flex-shrink-0"
        >
          <Tab key="all" title={`All (${data.length})`}></Tab>
          <Tab key="recent" title={`Recent (${recentCache})`}></Tab>
          <Tab key="frequent" title={`Active (${frequentCache})`}></Tab>
        </Tabs>
        <div className="flex md:justify-end md:flex-1">
          <Input
            placeholder="Search cache..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            className="w-full md:max-w-sm"
            variant="flat"
            isClearable
            onClear={() => setSearchQuery('')}
          />
        </div>
      </div>

      {/* Build Cache Table */}
      <Card className="p-0 bg-transparent border-0 border-blue-400/15 elevation-0 shadow-none">
        <CardBody className="px-0 py-0 bg-blue-400/5 rounded-lg">
          <Table
            aria-label="Build Cache table"
            removeWrapper
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor: any) => setSortDescriptor(descriptor)}
          >
            <TableHeader>
              <TableColumn key="id" allowsSorting>Cache ID</TableColumn>
              <TableColumn key="type" allowsSorting>Type</TableColumn>
              <TableColumn key="size" allowsSorting>Size</TableColumn>
              <TableColumn key="usage_count" allowsSorting>Usage Count</TableColumn>
              <TableColumn key="created" allowsSorting>Created</TableColumn>
              <TableColumn key="last_used" allowsSorting>Last Used</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredCache.map((cache) => (
                <TableRow key={cache.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
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
                    <div className="text-sm font-medium">{formatSize(cache.size)}</div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getUsageColor(cache.usage_count)}
                      startContent={<Activity className="w-3 h-3 m-1" />}
                    >
                      {cache.usage_count}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
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
