'use client'

import { Badge } from '@/components/ui/badge'

interface ProjectStatusBadgeProps {
  status: 'active' | 'completed' | 'dispute'
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          className: 'bg-blue-100 text-blue-700 hover:bg-blue-100'
        }
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-green-100 text-green-700 hover:bg-green-100'
        }
      case 'dispute':
        return {
          label: 'Dispute',
          className: 'bg-red-100 text-red-700 hover:bg-red-100'
        }
      default:
        return {
          label: 'Unknown',
          className: 'bg-gray-100 text-gray-700 hover:bg-gray-100'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant='secondary' className={config.className}>
      {config.label}
    </Badge>
  )
}

