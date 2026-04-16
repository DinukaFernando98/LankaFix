'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  Search, Download, ChevronLeft, ChevronRight, X, Loader2, SlidersHorizontal,
  Mail, Phone,
} from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import type { Status, Priority } from '@/types'

interface ComplaintRow {
  id: number
  referenceNumber: string
  title: string
  status: Status
  priority: Priority
  district: string | null
  createdAt: string
  category: { name: string; department: { name: string } }
  user: { fullName: string; email: string; mobile: string | null } | null
}

interface Category {
  id: number
  name: string
  departmentId: number
}

interface Props {
  departmentId: number | null
}

const DISTRICTS = [
  'Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha',
  'Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala',
  'Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya',
  'Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya',
]

const STATUSES: { value: Status; label: string }[] = [
  { value: 'Open', label: 'Open' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Urgent', label: 'Urgent' },
]

const priorityBadge: Record<Priority, string> = {
  Low: 'bg-gray-100 text-gray-600',
  Medium: 'bg-yellow-50 text-yellow-700',
  High: 'bg-red-50 text-red-700',
}

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

const drawerVariants: Variants = {
  hidden: { x: '100%' },
  show: { x: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } },
  exit: { x: '100%', transition: { duration: 0.2, ease: 'easeIn' } },
}

interface DrawerProps {
  complaint: ComplaintRow
  onClose: () => void
  onUpdated: () => void
}

function StatusDrawer({ complaint, onClose, onUpdated }: DrawerProps) {
  const [newStatus, setNewStatus] = useState<Status>(complaint.status)
  const [notes, setNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setIsUpdating(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/complaints/${complaint.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: notes.trim() || undefined }),
      })
      if (!res.ok) throw new Error()
      onUpdated()
      onClose()
    } catch {
      setError('Failed to update status. Please try again.')
      setIsUpdating(false)
    }
  }

  return (
    <>
      <motion.div
        variants={overlayVariants}
        initial="hidden" animate="show" exit="exit"
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <motion.div
        variants={drawerVariants}
        initial="hidden" animate="show" exit="exit"
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
      >
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-400 mb-0.5">{complaint.referenceNumber}</p>
            <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
              {complaint.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
          {complaint.user && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Submitter</p>
              <div className="bg-gray-50 rounded-xl p-3.5 space-y-2">
                <p className="text-sm font-semibold text-gray-900">{complaint.user.fullName}</p>
                <a
                  href={`mailto:${complaint.user.email}`}
                  className="flex items-center gap-2 text-xs text-green-600 hover:text-green-700"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {complaint.user.email}
                </a>
                {complaint.user.mobile && (
                  <a
                    href={`tel:${complaint.user.mobile}`}
                    className="flex items-center gap-2 text-xs text-green-600 hover:text-green-700"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {complaint.user.mobile}
                  </a>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Current Status</p>
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">New Status</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setNewStatus(value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer ${
                    newStatus === value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note about this status change..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating || newStatus === complaint.status}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUpdating ? 'Updating…' : 'Update Status'}
          </button>
        </div>
      </motion.div>
    </>
  )
}

const PAGE_SIZE = 20

export default function ComplaintsTable({ departmentId }: Props) {
  const [complaints, setComplaints] = useState<ComplaintRow[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRow | null>(null)

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((all: Category[]) => {
        const filtered = departmentId ? all.filter((c) => c.departmentId === departmentId) : all
        setCategories(filtered)
      })
      .catch(() => {})
  }, [departmentId])

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter) params.set('status', statusFilter)
    if (districtFilter) params.set('district', districtFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    params.set('page', String(page))

    try {
      const res = await fetch(`/api/admin/complaints?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setComplaints(data.complaints)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      setComplaints([])
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, statusFilter, districtFilter, categoryFilter, page])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  async function handleExportCsv() {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter) params.set('status', statusFilter)
    if (districtFilter) params.set('district', districtFilter)
    if (categoryFilter) params.set('category', categoryFilter)
    params.set('format', 'csv')
    const res = await fetch(`/api/admin/complaints?${params}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `complaints-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectClass =
    'px-3 py-2 text-sm text-gray-700 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer'

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or title…"
              className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className={selectClass}>
            <option value="">All Statuses</option>
            {STATUSES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
          </select>

          <select value={districtFilter} onChange={(e) => { setDistrictFilter(e.target.value); setPage(1) }} className={selectClass}>
            <option value="">All Districts</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }} className={selectClass}>
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-green-600" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center">
            <SlidersHorizontal className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No complaints match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Reference','Title','Category','District','Status','Priority','Date','Submitted By',''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-gray-500">{c.referenceNumber}</span>
                    </td>
                    <td className="px-5 py-3.5 max-w-48">
                      <p className="text-sm text-gray-900 font-medium truncate">{c.title}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-700">{c.category.name}</p>
                      <p className="text-xs text-gray-400">{c.category.department.name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{c.district || '—'}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={c.status} size="sm" /></td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${priorityBadge[c.priority]}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      {c.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-green-700">{c.user.fullName.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-xs text-gray-600 truncate max-w-24">{c.user.fullName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Guest</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setSelectedComplaint(c)}
                        className="text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && total > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-600 font-medium px-2">{page} / {pages}</span>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedComplaint && (
          <StatusDrawer
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
            onUpdated={fetchComplaints}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
