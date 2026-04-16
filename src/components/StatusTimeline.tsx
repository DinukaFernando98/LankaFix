'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Clock } from 'lucide-react'
import type { Status } from '@/types'

interface HistoryEntry {
  id: number
  status: Status
  notes: string | null
  changedAt: string
}

const statusLabel: Record<Status, string> = {
  Open: 'Complaint Received',
  InProgress: 'In Progress',
  Resolved: 'Resolved',
  Urgent: 'Marked Urgent',
}

const statusColor: Record<Status, string> = {
  Open: 'bg-yellow-100 text-yellow-700',
  InProgress: 'bg-blue-100 text-blue-700',
  Resolved: 'bg-green-100 text-green-700',
  Urgent: 'bg-red-100 text-red-700',
}

interface Props {
  entries: HistoryEntry[]
}

export default function StatusTimeline({ entries }: Props) {
  return (
    <div>
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1
        const isCompleted = !isLast || entry.status === 'Resolved'

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-green-600' : 'bg-green-100'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <Clock className="w-4 h-4 text-green-600" />
                )}
              </div>
              {!isLast && <div className="w-px flex-1 min-h-[28px] bg-gray-200 my-1" />}
            </div>

            <div className="pb-6 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-gray-900">
                  {statusLabel[entry.status]}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[entry.status]}`}
                >
                  {entry.status === 'InProgress' ? 'In Progress' : entry.status}
                </span>
              </div>
              {entry.notes && (
                <p className="text-sm text-gray-500 mb-1 leading-relaxed">{entry.notes}</p>
              )}
              <p className="text-xs text-gray-400">
                {new Date(entry.changedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
