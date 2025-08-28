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
import { Search, Container, FolderOpen, ArrowRight } from 'lucide-react'
import { apiService } from '@/services/api'
import type { BindMountInfo } from '@/types'
import { useState, useMemo } from 'react'

export default function BindMounts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'large' | 'containers'>('all')
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: "ascending" | "descending";
  }>({ column: "", direction: "ascending" });

  const { data, isLoading, error } = useQuery<BindMountInfo[]>(
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

    // Apply sorting
    if (sortDescriptor.column) {
      filtered = filtered.sort((a: BindMountInfo, b: BindMountInfo) => {
        let aValue: any;
        let bValue: any;

        switch (sortDescriptor.column) {
          case "container_name":
            aValue = a.container_name.toLowerCase();
            bValue = b.container_name.toLowerCase();
            break;
          case "source":
            aValue = a.source.toLowerCase();
            bValue = b.source.toLowerCase();
            break;
          case "destination":
            aValue = a.destination.toLowerCase();
            bValue = b.destination.toLowerCase();
            break;
          case "type":
            aValue = a.type.toLowerCase();
            bValue = b.type.toLowerCase();
            break;
          case "size":
            aValue = a.size;
            bValue = b.size;
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

  const truncatePath = (path: string, maxLength: number = 30) => {
    if (path.length <= maxLength) return path
    return `...${path.slice(-(maxLength - 3))}`
  }

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
      </div>

      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs
          aria-label="Filter Options"
          selectedKey={activeFilter}
          onSelectionChange={(key) => setActiveFilter(key as "all" | "large" | "containers")}
          variant="solid"
          color="primary"
          radius="full"
          className="md:flex-shrink-0"
        >
          <Tab key="all" title={`All (${data.length})`}></Tab>
          <Tab key="large" title={`Large (${largeMounts})`}></Tab>
          <Tab key="containers" title={`Apps (${uniqueContainers})`}></Tab>
        </Tabs>
        <div className="flex md:justify-end md:flex-1">
          <Input
            placeholder="Search bind mounts..."
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

      {/* Bind Mounts Table */}
      <Card className="p-0 bg-transparent border-0 border-blue-400/15 elevation-0 shadow-none">
        <CardBody className="px-0 py-0 bg-blue-400/5 rounded-lg">
          <Table
            aria-label="Bind Mounts table"
            removeWrapper
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor: any) => setSortDescriptor(descriptor)}
          >
            <TableHeader>
              <TableColumn key="container_name" allowsSorting>Container</TableColumn>
              <TableColumn key="source" allowsSorting>Source Path</TableColumn>
              <TableColumn key="destination" allowsSorting>Destination</TableColumn>
              <TableColumn key="type" allowsSorting>Type</TableColumn>
              <TableColumn key="size" allowsSorting>Size</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredMounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-500">No bind mounts to display</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMounts.map((mount, index) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}
