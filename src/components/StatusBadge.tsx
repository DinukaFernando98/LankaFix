import type { Status } from '@/types'

const config: Record<Status, { label: string; className: string }> = {
  Open: {
    label: 'Open',
    className: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  },
  InProgress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
  Resolved: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-800 border border-green-200',
  },
  Urgent: {
    label: 'Urgent',
    className: 'bg-red-100 text-red-800 border border-red-200',
  },
}

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const { label, className } = config[status]
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${
        size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1'
      } ${className}`}
    >
      {label}
    </span>
  )
}
