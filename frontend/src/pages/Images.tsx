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
import { HardDrive, Package, RefreshCw, Search, Container, Calendar, Hash } from 'lucide-react'
import { apiService } from '@/services/api'
import type { ImageInfo } from '@/types'
import { useState, useMemo } from 'react'

export default function Images() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'in-use' | 'unused'>('all')

  const { data, isLoading, error, refetch, isFetching } = useQuery<ImageInfo[]>(
    'images',
    apiService.getImages,
    { refetchInterval: 30000 }
  )

  const filteredImages = useMemo(() => {
    if (!data) return []

    let filtered = data.filter(image =>
      image.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.id.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Apply container filter
    if (activeFilter === 'in-use') {
      filtered = filtered.filter(image => image.containers > 0)
    } else if (activeFilter === 'unused') {
      filtered = filtered.filter(image => image.containers === 0)
    }

    return filtered
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

  const totalVirtualSize = useMemo(() => {
    if (!data) return 0
    return data.reduce((acc, image) => acc + image.virtual_size, 0)
  }, [data])

  const activeImages = useMemo(() => {
    if (!data) return 0
    return data.filter(image => image.containers > 0).length
  }, [data])

  const unusedImages = useMemo(() => {
    if (!data) return 0
    return data.filter(image => image.containers === 0).length
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
          <p className="text-red-600 dark:text-red-400">Failed to load images data. Please try again.</p>
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
            Docker Images
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and monitor your Docker images
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

        {/* Total Images */}
        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'all' ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('all')}
        >
          <CardBody className="p-2 bg-primary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
            </div>
            <p className="text-lg font-bold">{data.length}</p>
          </CardBody>
        </Card>

        {/* In Use Images */}
        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'in-use' ? 'ring-2 ring-green-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('in-use')}
        >
          <CardBody className="p-2 bg-green-500/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">In Use</p>
            </div>
            <p className="text-lg font-bold">{activeImages}</p>
          </CardBody>
        </Card>

        {/* Unused Images */}
        <Card
          className={`aspect-square cursor-pointer transition-all hover:scale-105 ${
            activeFilter === 'unused' ? 'ring-2 ring-red-500 shadow-lg' : ''
          }`}
          isPressable
          onPress={() => setActiveFilter('unused')}
        >
          <CardBody className="p-2 bg-red-500/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Unused</p>
            </div>
            <p className="text-lg font-bold">{unusedImages}</p>
          </CardBody>
        </Card>

        {/* Virtual Size */}
        <Card className="aspect-square">
          <CardBody className="p-2 bg-secondary/20 flex flex-col items-center justify-center text-center h-full">
            <div className="flex items-center gap-1 mb-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">Virtual</p>
            </div>
            <p className="text-sm font-bold">{formatSize(totalVirtualSize)}</p>
          </CardBody>
        </Card>

      </div>

      {/* Images Table */}
      <Card className='p-4'>
        <CardHeader className="p-0 pb-4 m-0 w-full flex">
          <div className="flex flex-row items-center justify-between gap-4 w-full">
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="max-w-xs"
              variant="flat"
            />
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredImages.length} of {data.length} images
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-0 py-0">
          <Table aria-label="Docker Images table" removeWrapper>
            <TableHeader>
              <TableColumn>REPOSITORY</TableColumn>
              <TableColumn>TAG</TableColumn>
              <TableColumn>IMAGE ID</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>SIZE</TableColumn>
              <TableColumn>CONTAINERS</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredImages.map((image) => (
                <TableRow key={image.id}>
                  <TableCell>
                    <div className="font-medium">{image.repository}</div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      {image.tag}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-gray-400" />
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                        {image.id.replace('sha256:', '').substring(0, 12)}
                      </code>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(image.created)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{formatSize(image.size)}</div>
                      {image.virtual_size !== image.size && (
                        <div className="text-xs text-gray-500">
                          Virtual: {formatSize(image.virtual_size)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getContainerStatusColor(image.containers)}
                      startContent={<Container className="w-3 h-3" />}
                    >
                      {image.containers === 0 ? 'Unused' : `${image.containers} container${image.containers > 1 ? 's' : ''}`}
                    </Chip>
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
