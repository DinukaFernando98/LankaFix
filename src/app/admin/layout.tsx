import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'Admin — LankaFix' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect('/auth')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        userName={session.user.fullName ?? 'Admin'}
        userEmail={session.user.email ?? ''}
      />
      <div className="flex-1 min-w-0 ml-64">{children}</div>
    </div>
  )
}
