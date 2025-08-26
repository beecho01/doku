import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTheme } from '@/contexts/ThemeContext'

interface UsageChartProps {
  data: {
    images: { count: number; size: number }
    containers: { count: number; size: number }
    volumes: { count: number; size: number }
    build_cache: { count: number; size: number }
    overlay2: { size: number }
    logs: { size: number }
    bind_mounts: { size: number }
  }
  diskUsage?: {
    used_bytes: number
    available_bytes: number
    total_bytes: number
    used_percent: number
  }
}

const DOKU_COLORS = [
  '#f0f5ff', // lightest (50)
  '#c5daff', // 100
  '#9bbeff', // 200
  '#6fa1ff', // 300
  '#4282ff', // 400
  '#1d63ed', // 500
  '#004cd7', // 600
  '#0037a2', // 700
  '#00236e', // 800
  '#001244', // darkest (900)
]

export default function UsageChart({ data, diskUsage }: UsageChartProps) {
  const { effectiveTheme } = useTheme()

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const chartData = useMemo(() => {

    // Create array of all items with their values
    const allItems = [
      { name: 'Images', value: data.images.size },
      { name: 'Containers', value: data.containers.size },
      { name: 'Volumes', value: data.volumes.size },
      { name: 'Build Cache', value: data.build_cache.size },
      { name: 'Overlay2', value: data.overlay2.size },
      { name: 'Logs', value: data.logs.size },
      { name: 'Bind Mounts', value: data.bind_mounts.size },
    ].filter(item => item.value > 0)

    // Sort by size (descending) - largest to smallest by actual byte value
    const sortedItems = [...allItems].sort((a, b) => b.value - a.value)

    // Return items in sorted order with colors assigned by rank
    return sortedItems.map((item, index) => {
      // Assign darker colors to larger values (index 0 = largest value = darkest color)
      // Distribute colors across the range, with largest values getting darkest colors
      const colorIndex = Math.min(
        Math.floor(index * (DOKU_COLORS.length - 1) / Math.max(sortedItems.length - 1, 1)),
        DOKU_COLORS.length - 1
      )

      // Reverse the color index so larger values get darker colors
      const reversedColorIndex = (DOKU_COLORS.length - 1) - colorIndex

      return {
        name: item.name,
        value: item.value,
        itemStyle: { color: DOKU_COLORS[reversedColorIndex] },
        label: {
          color: item.name === 'Available Space'
            ? (effectiveTheme === 'dark' ? '#6b7280' : '#9ca3af')
            : (effectiveTheme === 'dark' ? '#ffffff' : '#000000')
        }
      }
    })
  }, [data, diskUsage, effectiveTheme])

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `
          <div style="
            background: ${effectiveTheme === 'dark' ? '#1f2937' : '#ffffff'};
            border: 1px solid ${effectiveTheme === 'dark' ? '#374151' : '#e5e7eb'};
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            font-family: Inter, system-ui, sans-serif;
          ">
            <div style="
              font-weight: 600;
              color: ${effectiveTheme === 'dark' ? '#f9fafb' : '#111827'};
              margin-bottom: 4px;
            ">${params.name}</div>
            <div style="
              font-size: 14px;
              color: ${effectiveTheme === 'dark' ? '#9ca3af' : '#6b7280'};
            ">${formatBytes(params.value)}</div>
          </div>
        `
      },
      backgroundColor: 'transparent',
      borderWidth: 0,
      extraCssText: 'box-shadow: none;'
    },
    series: [
      {
        name: 'Disk Usage',
        type: 'treemap',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        roam: false,
        nodeClick: false,
        breadcrumb: {
          show: false
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff',
          gapWidth: 2
        },
        emphasis: {
          itemStyle: {
            borderColor: effectiveTheme === 'dark' ? '#374151' : '#e5e7eb',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'Inter, system-ui, sans-serif',
          formatter: (params: any) => {
            // Only show label if the rectangle is large enough
            if (params.value < chartData.reduce((sum, item) => sum + item.value, 0) * 0.05) {
              return ''
            }
            return `${params.name}\n${formatBytes(params.value)}`
          }
        },
        levels: [
          {
            itemStyle: {
              borderWidth: 0,
              gapWidth: 2
            }
          }
        ],
        data: chartData
      }
    ]
  }), [chartData, effectiveTheme, formatBytes])

  return (
    <div className="w-full h-full p-0 m-0">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  )
}
