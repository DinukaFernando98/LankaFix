import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Admin — LankaFix' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/auth')

  const deptId = session.user.departmentId
  const department = deptId
    ? await prisma.department.findUnique({ where: { id: deptId }, select: { name: true } })
    : null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        userName={session.user.fullName ?? 'Admin'}
        userEmail={session.user.email ?? ''}
        departmentId={deptId}
        departmentName={department?.name ?? null}
      />
      <div className="flex-1 min-w-0 ml-64">{children}</div>
    </div>
  )
}
