import { useQuery } from 'react-query'
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react'
import {
  Server,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react'
import { apiService } from '@/services/api'
import type { DashboardData, DockerEvent } from '@/types'
import UsageChart from '@/components/UsageChart'
import SummaryCards from '@/components/SummaryCards'

export default function Dashboard() {
  const { isOpen: isSystemOpen, onOpen: onSystemOpen, onClose: onSystemClose } = useDisclosure()
  const { isOpen: isEventsOpen, onOpen: onEventsOpen, onClose: onEventsClose } = useDisclosure()

  const { data, isLoading, error } = useQuery<DashboardData>(
    'dashboard',
    apiService.getDashboard,
    { refetchInterval: 30000 }
  )

  // New system queries
  const { data: systemInfo, isLoading: systemLoading } = useQuery(
    'systemInfo',
    apiService.getSystemInfo,
    { refetchInterval: 60000 } // Refresh every minute
  )

  const { data: pingStatus } = useQuery(
    'pingStatus',
    apiService.pingDocker,
    { refetchInterval: 10000 } // Ping every 10 seconds
  )

  const { data: events } = useQuery(
    'events',
    apiService.getEvents,
    { refetchInterval: 30000 } // Refresh every 30 seconds
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
      <Card className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
        <CardBody className="px-6 py-6">
          <p className="text-red-600 dark:text-red-400">Failed to load dashboard data. Please try again.</p>
        </CardBody>
      </Card>
    )
  }

  if (!data) return null

  // Helpers
  const versionText = `Docker ${data.docker_version.version}`
  const platformText = `API ${data.docker_version.api_version} • ${data.docker_version.platform.name}`

  return (
    <div className="space-y-4 font-sans">

      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between pb-2">
        <div className="min-w-0 w-full">
          <div className="m-0 p-2 flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700">
            <span className="font-medium">{versionText}</span>
            <span className="opacity-70">{platformText}</span>
          </div>
        </div>

        {/* System Status */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            startContent={<Server className="w-4 h-4" />}
            onClick={onSystemOpen}
            isLoading={systemLoading}
          >
            System Info
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="secondary"
            startContent={<Bell className="w-4 h-4" />}
            onClick={onEventsOpen}
          >
            Events ({events?.length || 0})
          </Button>
          <div className="flex items-center gap-1">
            {pingStatus?.status === 'ok' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs text-gray-600 dark:text-gray-400">Docker</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <h2 className='text-lg font-semibold pl-1 pt-2'>
        Usage distribution
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:gap-8">

        <div className='pt-0 px-0 pb-0'>
          <div className='p-0 m-0'>
            <div className="h-64 xs:h-36 sm:h-48 md:h-56 text-white">
              <UsageChart data={data.summary} diskUsage={data.disk_usage} />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory (folded by default to reduce visual noise) */}
      <h2 className='text-lg font-semibold pl-1 pt-4'>
        Summary
      </h2>
      <SummaryCards data={data.summary} />

      <h2 className='text-lg font-semibold pl-1 pt-4'>
        Last Scan
      </h2>
      {/* Last Scan */}
      <Card className="dark:bg-blue-400/5">
        <CardBody className="px-6 py-5">
          <div className="flex flex-row items-start justify-between gap-3">
            <div className="flex gap-3 flex-1 min-w-0">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base pb-2">Last scan</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {data.scan_status.last_scan_time
                    ? new Date(data.scan_status.last_scan_time).toLocaleString()
                    : 'Unknown'
                  }
                  {data.scan_status.scan_duration && (
                    <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                      Duration: {(data.scan_status.scan_duration / 1000).toFixed(1)}s
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Chip
              color={data.scan_status.last_scan_time ? "success" : "default"}
              variant="flat"
              size="sm"
              className="flex-shrink-0"
            >
              {data.scan_status.last_scan_time ? 'Completed' : 'No Data'}
            </Chip>
          </div>
        </CardBody>
      </Card>

      {/* System Info Modal */}
      <Modal isOpen={isSystemOpen} onClose={onSystemClose} size="4xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-500" />
              <span>Docker System Information</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {systemInfo ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <h3 className="text-sm font-medium">System Resources</h3>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Containers:</span>
                          <span className="font-medium">{systemInfo.ContainersRunning} running, {systemInfo.ContainersStopped} stopped</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Images:</span>
                          <span className="font-medium">{systemInfo.Images}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Memory:</span>
                          <span className="font-medium">{(systemInfo.MemTotal / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CPU Cores:</span>
                          <span className="font-medium">{systemInfo.NCPU}</span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <h3 className="text-sm font-medium">Docker Details</h3>
                    </CardHeader>
                    <CardBody className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Version:</span>
                          <span className="font-medium">{systemInfo.ServerVersion}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Storage Driver:</span>
                          <span className="font-medium">{systemInfo.Driver}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OS:</span>
                          <span className="font-medium">{systemInfo.OperatingSystem}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Architecture:</span>
                          <span className="font-medium">{systemInfo.Architecture}</span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Events Modal */}
      <Modal isOpen={isEventsOpen} onClose={onEventsClose} size="4xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <span>Recent Docker Events</span>
            </div>
          </ModalHeader>
          <ModalBody>
            {events && events.length > 0 ? (
              <Table aria-label="Events table" removeWrapper>
                <TableHeader>
                  <TableColumn>Time</TableColumn>
                  <TableColumn>Type</TableColumn>
                  <TableColumn>Action</TableColumn>
                  <TableColumn>Resource</TableColumn>
                </TableHeader>
                <TableBody>
                  {events.map((event: DockerEvent, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(event.time * 1000).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="primary">
                          {event.Type}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="secondary">
                          {event.Action}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {event.Actor.Attributes.name || event.Actor.ID.substring(0, 12)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent events
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}
