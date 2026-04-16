import Link from 'next/link'
import { Clock, FileText } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import StatsGrid from '@/components/admin/StatsGrid'
import StatusBadge from '@/components/StatusBadge'

async function getData() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [total, open, inProgress, resolved, urgent, thisMonth, recent] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: 'Open' } }),
    prisma.complaint.count({ where: { status: 'InProgress' } }),
    prisma.complaint.count({ where: { status: 'Resolved' } }),
    prisma.complaint.count({ where: { status: 'Urgent' } }),
    prisma.complaint.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.complaint.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } } },
    }),
  ])

  return { total, open, inProgress, resolved, urgent, thisMonth, recent }
}

export default async function AdminDashboard() {
  const data = await getData()

  return (
    <main className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of all complaints and activity.</p>
      </div>

      <StatsGrid
        total={data.total}
        open={data.open}
        inProgress={data.inProgress}
        resolved={data.resolved}
        urgent={data.urgent}
        thisMonth={data.thisMonth}
      />

      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Complaints</h2>
          <Link
            href="/admin/complaints"
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            View all →
          </Link>
        </div>

        <div className="divide-y divide-gray-50">
          {data.recent.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No complaints yet.</p>
            </div>
          )}
          {data.recent.map((c) => (
            <div key={c.id} className="px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-gray-400">{c.referenceNumber}</p>
                <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{c.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.category.name}</p>
              </div>
              <StatusBadge status={c.status} size="sm" />
              <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {new Date(c.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
