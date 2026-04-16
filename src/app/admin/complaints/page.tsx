import ComplaintsTable from '@/components/admin/ComplaintsTable'

export const metadata = { title: 'Complaints — LankaFix Admin' }

export default function ComplaintsPage() {
  return (
    <main className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and update all reported complaints.
        </p>
      </div>
      <ComplaintsTable />
    </main>
  )
}
