import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminHotzoneClient from '@/components/admin/AdminHotzoneClient'

export const metadata = { title: 'Hotzone Map — LankaFix Admin' }

export default async function AdminHotzonePage() {
  const session = await auth()
  const deptId = session?.user?.departmentId ?? null

  const department = deptId
    ? await prisma.department.findUnique({ where: { id: deptId }, select: { name: true } })
    : null

  const allDepts = !deptId
    ? await prisma.department.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
    : []

  return (
    <main className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {department ? `${department.name} — Hotzone Map` : 'Civic Issue Hotzone Map'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          K-Means cluster analysis of geo-tagged complaint locations.
        </p>
      </div>
      <AdminHotzoneClient
        fixedDepartmentId={deptId}
        departments={allDepts}
      />
    </main>
  )
}
