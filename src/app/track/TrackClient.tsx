'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import StatusBadge from '@/components/StatusBadge'
import StatusTimeline from '@/components/StatusTimeline'
import { Search, Loader2, MapPin, Calendar, Tag, AlertCircle, FileText } from 'lucide-react'
import type { Status, Priority } from '@/types'

interface ComplaintDetail {
  id: number
  referenceNumber: string
  title: string
  description: string
  photoUrl: string | null
  address: string | null
  district: string
  status: Status
  priority: Priority
  createdAt: string
  updatedAt: string
  category: {
    name: string
    department: { name: string }
  }
  statusHistory: {
    id: number
    status: Status
    notes: string | null
    changedAt: string
  }[]
}

const priorityBadge: Record<Priority, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-yellow-50 text-yellow-700',
  High: 'bg-red-50 text-red-700',
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function TrackClient() {
  const searchParams = useSearchParams()

  const [refInput, setRefInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setRefInput(ref.toUpperCase())
      performSearch(ref.toUpperCase())
    }
  }, [])

  async function performSearch(query: string) {
    setIsSearching(true)
    setNotFound(false)
    setComplaint(null)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/complaints/${encodeURIComponent(query)}`)
      if (response.status === 404) {
        setNotFound(true)
        return
      }
      if (!response.ok) throw new Error()
      setComplaint(await response.json())
    } catch {
      setNotFound(true)
    } finally {
      setIsSearching(false)
    }
  }

  function handleSearch() {
    const query = refInput.trim().toUpperCase()
    if (!query) return
    performSearch(query)
  }

  return (
    <main className="flex-1 bg-white">
      <section className="bg-white pt-24 pb-14 border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full border border-green-200 mb-5">
              <Search className="w-3.5 h-3.5" />
              Complaint Tracker
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              Track Your Report
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-md mx-auto">
              Enter your reference number to see the current status and history of your complaint.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex gap-2 max-w-md mx-auto"
          >
            <input
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g. CR-2026-00001"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              aria-label="Reference number"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching || !refInput.trim()}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isSearching ? 'Searching...' : 'Track'}
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-10 bg-gray-50 min-h-64">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {!hasSearched && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-400 py-14"
              >
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-25" />
                <p className="text-sm">Enter a reference number above to get started.</p>
              </motion.div>
            )}

            {isSearching && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-14"
              >
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
              </motion.div>
            )}

            {notFound && !isSearching && (
              <motion.div
                key="notfound"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-14"
              >
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Report not found</h3>
                <p className="text-sm text-gray-500">
                  No complaint matches{' '}
                  <span className="font-mono font-medium text-gray-700">{refInput}</span>.
                  <br />
                  Please check the reference number and try again.
                </p>
              </motion.div>
            )}

            {complaint && !isSearching && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 sm:px-6 py-5 border-b border-gray-50 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-medium text-gray-400 mb-0.5">
                        {complaint.referenceNumber}
                      </p>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                        {complaint.title}
                      </h2>
                    </div>
                    <StatusBadge status={complaint.status} size="sm" />
                  </div>

                  <div className="px-5 sm:px-6 py-5 space-y-4">
                    <DetailRow
                      icon={<Tag className="w-4 h-4 text-gray-400" />}
                      label="Category"
                      value={`${complaint.category.name} — ${complaint.category.department.name}`}
                    />
                    <DetailRow
                      icon={<MapPin className="w-4 h-4 text-gray-400" />}
                      label="Location"
                      value={[complaint.address, complaint.district].filter(Boolean).join(', ')}
                    />
                    <DetailRow
                      icon={<Calendar className="w-4 h-4 text-gray-400" />}
                      label="Submitted"
                      value={formatDate(complaint.createdAt)}
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-500">Priority</span>
                      <span
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${priorityBadge[complaint.priority]}`}
                      >
                        {complaint.priority}
                      </span>
                    </div>
                  </div>

                  {complaint.description && (
                    <div className="px-5 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-1.5">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {complaint.description}
                      </p>
                    </div>
                  )}

                  {complaint.photoUrl && (
                    <div className="px-5 sm:px-6 py-4 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Attached Photo</p>
                      <img
                        src={complaint.photoUrl}
                        alt="Complaint evidence"
                        className="w-48 h-36 object-cover rounded-xl border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-5">Status History</h3>
                  <StatusTimeline entries={complaint.statusHistory} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}
