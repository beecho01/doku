import { useQuery } from 'react-query'
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Button
} from '@heroui/react'
import { Container, Radar, Check, RefreshCw, Activity } from 'lucide-react'
import { apiService } from '@/services/api'
import type { DashboardData } from '@/types'
import UsageChart from '@/components/UsageChart'
import SummaryCards from '@/components/SummaryCards'

export default function Dashboard() {
  const { data, isLoading, error, refetch, isFetching } = useQuery<DashboardData>(
    'dashboard',
    apiService.getDashboard,
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
          <div className="flex justify-between">
            {/*<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Docker Disk Usage</h1>
            <Chip
              color={data.scan_status.is_scanning ? 'warning' : 'success'}
              variant="flat"
              startContent={data.scan_status.is_scanning ? <Radar size={16} /> : <Check size={16} />}
              size="sm"
              className="whitespace-nowrap"
            >
            {data.scan_status.is_scanning ? 'Scanning…' : 'Ready'}
          </Chip>*/}
          </div>
          <div className="m-0 p-2 flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700">
            <span className="font-medium">{versionText}</span>
            <span className="opacity-70">{platformText}</span>
          </div>
        </div>
        {/*<div className="flex items-center gap-3">
          <Button
            size="sm"
            startContent={<RefreshCw className="w-4 h-4" />}
            onPress={() => refetch()}
            isDisabled={isFetching}
            variant="flat"
          >
            {isFetching ? 'Refreshing' : 'Refresh'}
          </Button>
        </div>*/}
      </div>

      {/* Main Grid */}
      <h2 className='text-lg font-semibold pl-1 pt-2'>
        Usage distribution
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

        <div className='pt-0 px-0 pb-0'>
          {/*<CardHeader className="flex flex-col items-start text-left p-0">
            <h2 className="text-lg sm:text-xl font-semibold">Usage distribution</h2>
            <p className="pt-1 text-xs text-gray-500 pb-3">Sizes by component</p>
          </CardHeader>*/}
          <div className='p-0 m-0'>
            <div className="h-56 sm:h-64">
              <UsageChart data={data.summary} diskUsage={data.disk_usage} />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory (folded by default to reduce visual noise) */}
      <h2 className='text-lg font-semibold pl-1 pt-4'>
        Summary Cards
      </h2>
      <SummaryCards data={data.summary} />


      <h2 className='text-lg font-semibold pl-1 pt-4'>
        Last Scan
      </h2>
      {/* Last Scan */}
      {data.scan_status.last_scan_time && (
        <Card className="dark:bg-blue-400/5">
          <CardBody className="px-6 py-5">
            <div className="flex flex-row items-start justify-between gap-3">
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base pb-2">Last scan</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {new Date(data.scan_status.last_scan_time).toLocaleString()}
                    {data.scan_status.scan_duration && (
                      <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                        Duration: {(data.scan_status.scan_duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <Chip color="success" variant="flat" size="sm" className="flex-shrink-0">
                Completed
              </Chip>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
