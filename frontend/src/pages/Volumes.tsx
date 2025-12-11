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
import { Search, Container } from 'lucide-react'
import { apiService } from '@/services/api'
import type { VolumeInfo } from '@/types'
import { useState, useMemo } from 'react'

export default function Volumes() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-use' | 'unused' | 'large'>('all')
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: "ascending" | "descending";
  }>({ column: "", direction: "ascending" });

  const { data, isLoading, error } = useQuery<VolumeInfo[]>(
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

    // Apply sorting
    if (sortDescriptor.column) {
      filtered = filtered.sort((a: VolumeInfo, b: VolumeInfo) => {
        let aValue: any;
        let bValue: any;

        switch (sortDescriptor.column) {
          case "name":
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case "driver":
            aValue = a.driver.toLowerCase();
            bValue = b.driver.toLowerCase();
            break;
          case "size":
            aValue = a.size;
            bValue = b.size;
            break;
          case "containers":
            aValue = a.containers;
            bValue = b.containers;
            break;
          case "created":
            aValue = new Date(a.created).getTime();
            bValue = new Date(b.created).getTime();
            break;
          case "mount_point":
            aValue = a.mount_point.toLowerCase();
            bValue = b.mount_point.toLowerCase();
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

  const inUseVolumes = useMemo(() => {
    if (!data) return 0
    return data.filter(volume => volume.containers > 0).length
  }, [data])

  const unusedVolumes = useMemo(() => {
    if (!data) return 0
    return data.filter(volume => volume.containers === 0).length
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
            Volumes
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor your Docker volumes
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Tabs
          aria-label="Filter Options"
          selectedKey={activeFilter}
          onSelectionChange={(key) => setActiveFilter(key as "all" | "in-use" | "unused" | "large")}
          variant="solid"
          color="primary"
          radius="full"
          className="md:flex-shrink-0"
        >
          <Tab key="all" title={`All (${data.length})`}></Tab>
          <Tab key="in-use" title={`In Use (${inUseVolumes})`}></Tab>
          <Tab key="unused" title={`Unused (${unusedVolumes})`}></Tab>
        </Tabs>
        <div className="flex md:justify-end md:flex-1">
          <Input
            placeholder="Search volumes..."
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

      {/* Volumes Table */}
      <Card className="p-0 bg-transparent border-0 border-blue-400/15 elevation-0 shadow-none">
        <CardBody className="px-0 py-0 bg-blue-400/5 rounded-lg">
          <Table
            aria-label="Docker Volumes table"
            removeWrapper
            sortDescriptor={sortDescriptor}
            onSortChange={(descriptor: any) => setSortDescriptor(descriptor)}
          >
            <TableHeader>
              <TableColumn key="name" allowsSorting>Name</TableColumn>
              <TableColumn key="driver" allowsSorting>Driver</TableColumn>
              <TableColumn key="size" allowsSorting>Size</TableColumn>
              <TableColumn key="containers" allowsSorting>Containers</TableColumn>
              <TableColumn key="created" allowsSorting>Created</TableColumn>
              <TableColumn key="mount_point" allowsSorting>Mount Point</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredVolumes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-500">No volumes to display</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVolumes.map((volume) => (
                  <TableRow key={volume.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{volume.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" color="default">
                        {volume.driver}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{formatSize(volume.size)}</div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getContainerStatusColor(volume.containers)}
                        startContent={<Container className="w-3 h-3 m-1" />}
                      >
                        {volume.containers === 0 ? 'Unused' : `${volume.containers} container${volume.containers > 1 ? 's' : ''}`}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        {formatDate(volume.created)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono max-w-xs truncate">
                          {volume.mount_point}
                        </code>
                      </div>
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
