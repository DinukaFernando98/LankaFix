import { auth } from '@/lib/auth'
import ComplaintsTable from '@/components/admin/ComplaintsTable'

export const metadata = { title: 'Complaints — LankaFix Admin' }

export default async function ComplaintsPage() {
  const session = await auth()
  const departmentId = session?.user?.departmentId ?? null

  return (
    <main className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <p className="text-sm text-gray-500 mt-1">
          {departmentId
            ? 'Complaints routed to your department — update status and contact submitters here.'
            : 'All complaints across every department.'}
        </p>
      </div>
      <ComplaintsTable departmentId={departmentId} />
    </main>
  )
}
