import { Card, CardBody, CardHeader, Chip } from '@heroui/react'

interface SummaryCardsProps {
  data: {
    images: { count: number; size: number }
    containers: { count: number; size: number }
    volumes: { count: number; size: number }
    build_cache: { count: number; size: number }
    overlay2: { count: number; size: number }
    logs: { count: number; size: number }
    bind_mounts: { count: number; size: number }
  }
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const cards = [
    {
      title: 'Images',
      count: data.images.count,
      size: data.images.size,
      color: 'doku',
      colorVariant: '500',
      href: '/images'
    },
    {
      title: 'Containers',
      count: data.containers.count,
      size: data.containers.size,
      color: 'doku',
      colorVariant: '600',
      href: '/containers'
    },
    {
      title: 'Volumes',
      count: data.volumes.count,
      size: data.volumes.size,
      color: 'doku',
      colorVariant: '400',
      href: '/volumes'
    },
    {
      title: 'Build Cache',
      count: data.build_cache.count,
      size: data.build_cache.size,
      color: 'doku',
      colorVariant: '700',
      href: '/build-cache'
    },
    {
      title: 'Overlay2',
      count: data.overlay2.count,
      size: data.overlay2.size,
      color: 'doku',
      colorVariant: '300',
      href: '/overlay2'
    },
    {
      title: 'Container Logs',
      count: data.logs.count,
      size: data.logs.size,
      color: 'doku',
      colorVariant: '800',
      href: '/logs'
    },
    {
      title: 'Bind Mounts',
      count: data.bind_mounts.count,
      size: data.bind_mounts.size,
      color: 'doku',
      colorVariant: '200',
      href: '/bind-mounts'
    },
  ]

  return (
    <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 ">
      {cards.map((card) => {
        return (
          <Card
            key={card.title}
            isPressable
            className="p-2 hover:scale-105 transition-transform cursor-pointer rounded-2xl dark:bg-blue-400/5"
            as="a"
            href={card.href}
          >
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate p-0 m-0 flex-1">
                {card.title}
              </p>
              <Chip
                variant="flat"
                size="sm"
                className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30">
                {formatBytes(card.size)}
              </Chip>
            </CardHeader>

            <CardBody className="flex flex-col justify-end">
              {card.count > 0 && (
                <div className="text-left flex flex-row items-baseline gap-2">
                  <p className="font-mono text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {card.count.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    items
                  </p>
                </div>
              )}
            </CardBody>
          </Card>
        )
      })}
    </div>
  )
}
