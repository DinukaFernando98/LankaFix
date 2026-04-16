import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Building2, Tag, Users } from 'lucide-react'

export const metadata = { title: 'Departments — LankaFix Admin' }

export default async function DepartmentsPage() {
  const session = await auth()
  if (!session?.user?.isAdmin || session.user.departmentId !== null) redirect('/admin')

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      categories: { select: { id: true, name: true } },
      _count: { select: { admins: true } },
    },
  })

  const complaintCounts = await prisma.complaint.groupBy({
    by: ['categoryId'],
    _count: { id: true },
  })

  const deptComplaintMap: Record<number, number> = {}
  for (const dept of departments) {
    const catIds = new Set(dept.categories.map((c) => c.id))
    deptComplaintMap[dept.id] = complaintCounts
      .filter((r) => catIds.has(r.categoryId))
      .reduce((s, r) => s + r._count.id, 0)
  }

  return (
    <main className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
        <p className="text-sm text-gray-500 mt-1">
          All departments and their complaint categories.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{dept.name}</p>
                  {dept.contactEmail && (
                    <p className="text-xs text-gray-400">{dept.contactEmail}</p>
                  )}
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900 flex-shrink-0">
                {deptComplaintMap[dept.id] ?? 0}
                <span className="text-xs font-normal text-gray-400 ml-1">complaints</span>
              </span>
            </div>

            <div className="space-y-1.5 mb-4">
              {dept.categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 text-xs text-gray-600">
                  <Tag className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  {cat.name}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 pt-3 border-t border-gray-50">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                {dept._count.admins} dept admin{dept._count.admins !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
