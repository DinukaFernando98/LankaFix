'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  Loader2,
  FileText,
  MapPin,
  Tag,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Circle,
  Zap,
} from 'lucide-react'

interface Ticket {
  id: number
  referenceNumber: string
  title: string
  status: 'Open' | 'InProgress' | 'Resolved' | 'Urgent'
  priority: 'Low' | 'Medium' | 'High'
  address: string | null
  district: string | null
  createdAt: string
  updatedAt: string
  photoUrl: string | null
  category: { name: string }
  statusHistory: { notes: string | null; changedAt: string }[]
}

const STATUS_CONFIG: Record<
  Ticket['status'],
  { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  Open: {
    label: 'Open',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <Circle className="w-3 h-3" />,
  },
  InProgress: {
    label: 'In Progress',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    icon: <Loader2 className="w-3 h-3" />,
  },
  Resolved: {
    label: 'Resolved',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  Urgent: {
    label: 'Urgent',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: <AlertCircle className="w-3 h-3" />,
  },
}

const PRIORITY_CONFIG: Record<Ticket['priority'], { dot: string; label: string }> = {
  Low: { dot: 'bg-green-500', label: 'Low' },
  Medium: { dot: 'bg-yellow-500', label: 'Medium' },
  High: { dot: 'bg-red-500', label: 'High' },
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function MyTicketsClient() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/my-tickets')
      .then((r) => r.json())
      .then(setTickets)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-green-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 ml-12">
            All civic issues you&apos;ve submitted
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No reports yet</p>
            <p className="text-xs text-gray-400 mb-6">
              Submit your first civic issue report to see it here.
            </p>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors duration-200"
            >
              Submit a Report
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-4 text-right">
              {tickets.length} report{tickets.length !== 1 ? 's' : ''}
            </p>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {tickets.map((ticket) => {
                const sc = STATUS_CONFIG[ticket.status]
                const pc = PRIORITY_CONFIG[ticket.priority]
                const lastUpdate = ticket.statusHistory[0]

                return (
                  <motion.div
                    key={ticket.id}
                    variants={cardVariant}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                              #{ticket.referenceNumber}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}
                            >
                              {sc.icon}
                              {sc.label}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2">
                            {ticket.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {ticket.category.name}
                            </span>
                            {(ticket.district || ticket.address) && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {ticket.district || ticket.address}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(ticket.createdAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
                              {pc.label} Priority
                            </span>
                          </div>
                        </div>

                        {ticket.photoUrl && (
                          <div className="flex-shrink-0 hidden sm:block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ticket.photoUrl}
                              alt=""
                              className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                            />
                          </div>
                        )}
                      </div>

                      {lastUpdate?.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-50">
                          <p className="text-xs text-gray-500 line-clamp-2">
                            <span className="font-medium text-gray-600">Latest update: </span>
                            {lastUpdate.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="px-5 py-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        Updated {formatDate(ticket.updatedAt)}
                      </p>
                      <Link
                        href={`/track?ref=${ticket.referenceNumber}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors duration-200"
                      >
                        Track Report
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </>
        )}
      </div>
    </main>
  )
}
