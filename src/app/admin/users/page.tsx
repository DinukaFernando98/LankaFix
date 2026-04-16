import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UsersTable from '@/components/admin/UsersTable'

export const metadata = { title: 'Users — LankaFix Admin' }

export default async function UsersPage() {
  const session = await auth()
  if (!session?.user?.isAdmin || session.user.departmentId !== null) redirect('/admin')

  return (
    <main className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage user accounts and assign admin roles to department staff.
        </p>
      </div>
      <UsersTable currentUserId={session.user.id} />
    </main>
  )
}
